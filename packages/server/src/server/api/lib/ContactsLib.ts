import { Server } from "@server";
import { isMinHighSierra } from "@server/env";
import { execFile } from "child_process";

// Only import node-mac-contacts if we are on macOS 10.13 or higher
// This is because node-mac-contacts was compiled for macOS 10.13 or higher
// This library is here to prevent a crash on lower macOS versions
let contacts: any = null;
try {
    if (isMinHighSierra) contacts = require("node-mac-contacts");
} catch {
    contacts = null;
}

// Escape a string for safe inclusion inside an AppleScript double-quoted literal.
function aqs(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

// Var to track if this is the first time we are loading contacts.
// If it's the first time, we need to load all available info, so it's cached
let isFirstLoad = true;

export class ContactsLib {
    static allExtraProps = [
        'jobTitle',
        'departmentName',
        'organizationName',
        'middleName',
        'note',
        'contactImage',
        'contactThumbnailImage',
        'instantMessageAddresses',
        'socialProfiles'
    ];

    static async requestAccess() {
        if (!contacts) return "Unknown";
        return await contacts.requestAccess();
    }

    static getAuthStatus() {
        if (!contacts) return "Unknown";
        return contacts.getAuthStatus();
    }

    static getContactPermissionStatus() {
        if (!contacts) return "Unknown";
        return contacts.getContactPermissionStatus();
    }

    static getAllContacts(extraProps: string[] = []) {
        if (!contacts) return [];

        // If it's the first load, we need to load all available info.
        // And also listen for changes so we can reload all the info again.
        if (isFirstLoad) {
            isFirstLoad = false;
            contacts.getAllContacts(ContactsLib.allExtraProps);
            ContactsLib.listenForChanges();
        }

        return contacts.getAllContacts(extraProps);
    }

    static listenForChanges() {
        if (!contacts) return;
        contacts.listener.setup();
        contacts.listener.once('contact-changed', (_: string) => {
            Server().log("Detected contact change, queueing full reload...", "debug");
            isFirstLoad = true;
            contacts.listener.remove();
        });
    }

    // Add a contact to the native macOS Contacts.app (which iCloud-syncs to all the
    // user's devices). Used to auto-import every iMessage sender as a CRM lead so
    // future outbound from this Mac auto-shares Name & Photo via "Contacts Only" mode.
    static addNativeContact({
        firstName,
        lastName = "",
        phoneNumbers = [],
        emails = []
    }: {
        firstName: string;
        lastName?: string;
        phoneNumbers?: string[];
        emails?: string[];
    }): { ok: boolean; error?: string } {
        if (!contacts) return { ok: false, error: "node-mac-contacts unavailable" };
        try {
            contacts.addNewContact({
                firstName,
                lastName,
                phoneNumbers,
                emails
            });
            return { ok: true };
        } catch (e: any) {
            return { ok: false, error: e?.message ?? String(e) };
        }
    }

    // Idempotent: only adds if no existing native contact has any of these handles.
    // Uses AppleScript (osascript) to drive Contacts.app instead of node-mac-contacts,
    // because node-mac-contacts.addNewContact silently no-ops on macOS 26 (TCC bucket
    // mismatch). AppleScript automation lives in the kTCCServiceAppleEvents bucket
    // which the user can grant via the System Settings prompt that fires on first call.
    static async addNativeContactIfMissing({
        firstName,
        lastName = "",
        phoneNumbers = [],
        emails = []
    }: {
        firstName: string;
        lastName?: string;
        phoneNumbers?: string[];
        emails?: string[];
    }): Promise<{ ok: boolean; created: boolean; error?: string; id?: string }> {
        const allHandles = [...phoneNumbers, ...emails].filter(Boolean);
        if (allHandles.length === 0) {
            return { ok: false, created: false, error: "no handles" };
        }

        // AppleScript: search for any existing person whose value of phones or emails
        // matches one of our handles. If found, return its id (skip create). If not,
        // create the person and add phones/emails, save, and return the new id.
        const handlesAS = allHandles.map(h => `"${aqs(h)}"`).join(", ");
        const phonesAS = phoneNumbers.map(p => `"${aqs(p)}"`).join(", ");
        const emailsAS = emails.map(e => `"${aqs(e)}"`).join(", ");
        const script = `
tell application "Contacts"
    set targetHandles to {${handlesAS}}
    set foundId to ""
    repeat with p in every person
        try
            set personPhones to value of every phone of p
        on error
            set personPhones to {}
        end try
        try
            set personEmails to value of every email of p
        on error
            set personEmails to {}
        end try
        repeat with h in targetHandles
            if personPhones contains (h as string) or personEmails contains (h as string) then
                set foundId to (id of p as string)
                exit repeat
            end if
        end repeat
        if foundId is not "" then exit repeat
    end repeat
    if foundId is not "" then
        return "EXISTS:" & foundId
    end if
    set newPerson to make new person with properties {first name:"${aqs(firstName)}", last name:"${aqs(lastName)}"}
    set phs to {${phonesAS}}
    repeat with v in phs
        make new phone at end of phones of newPerson with properties {label:"mobile", value:(v as string)}
    end repeat
    set ems to {${emailsAS}}
    repeat with v in ems
        make new email at end of emails of newPerson with properties {label:"work", value:(v as string)}
    end repeat
    save
    return "CREATED:" & (id of newPerson as string)
end tell`;

        return new Promise((resolve) => {
            execFile("/usr/bin/osascript", ["-e", script], { timeout: 30000 }, (err, stdout, stderr) => {
                if (err) {
                    return resolve({ ok: false, created: false, error: stderr?.toString() || err.message });
                }
                const out = (stdout || "").trim();
                if (out.startsWith("EXISTS:")) {
                    return resolve({ ok: true, created: false, id: out.slice(7) });
                }
                if (out.startsWith("CREATED:")) {
                    return resolve({ ok: true, created: true, id: out.slice(8) });
                }
                resolve({ ok: false, created: false, error: `unexpected output: ${out}` });
            });
        });
    }
}