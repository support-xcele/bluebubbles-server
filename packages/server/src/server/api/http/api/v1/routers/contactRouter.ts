import { RouterContext } from "koa-router";
import { Next } from "koa";

import { isEmpty, isNotEmpty } from "@server/helpers/utils";
import { ContactInterface } from "@server/api/interfaces/contactInterface";
import { ContactsLib } from "@server/api/lib/ContactsLib";
import { Success } from "../responses/success";
import { Contact } from "@server/databases/server/entity";
import { parseWithQuery } from "../utils";
import { BadRequest } from "../responses/errors";

export class ContactRouter {
    private static isAddressObject(data: any): boolean {
        return (
            data &&
            typeof data === "object" &&
            !Array.isArray(data) &&
            (Object.keys(data).includes("firstName") || Object.keys(data).includes("displayName"))
        );
    }

    static async get(ctx: RouterContext, _: Next) {
        const extraProps = parseWithQuery(ctx.request.query?.extraProperties as string)
        const contacts = await ContactInterface.getAllContacts(extraProps);
        return new Success(ctx, { data: contacts }).send();
    }

    static async query(ctx: RouterContext, _: Next) {
        const { body } = ctx.request;
        const addresses = body?.addresses ?? [];
        const extraProps = parseWithQuery(body?.extraProperties ?? [], false);

        if (!Array.isArray(addresses)) {
            throw new BadRequest({ 'error': 'Addresses must be an array of strings!' });
        }

        let res = [];
        if (isEmpty(addresses)) {
            res = await ContactInterface.getAllContacts(extraProps);
        } else {
            res = await ContactInterface.queryContacts(addresses, extraProps);
        }

        return new Success(ctx, { data: res }).send();
    }

    static async create(ctx: RouterContext, _: Next) {
        let { body } = ctx.request;

        // Make the body into an array if it isn't. This is so
        // we can seamlessly iterate over all the objects
        if (typeof body === "object" && !Array.isArray(body)) {
            body = [body];
        }

        const contacts: Contact[] = [];
        const errors: any[] = [];
        for (const item of body) {
            if (!ContactRouter.isAddressObject(item)) {
                errors.push({
                    entry: item,
                    error: "Input address object is not contain the required information!"
                });

                continue;
            }

            try {
                contacts.push(
                    await ContactInterface.createContact({
                        firstName: item.firstName ?? '',
                        lastName: item?.lastName ?? '',
                        displayName: item?.displayName ?? '',
                        phoneNumbers: item?.phoneNumbers ?? [],
                        emails: item?.emails ?? [],
                        avatar: item?.avatar ?? null,
                        updateEntry: true
                    })
                );
            } catch (ex: any) {
                console.log(ex);
                errors.push({
                    entry: item,
                    error: ex?.message ?? String(ex)
                });
            }
        }

        const output: any = { data: ContactInterface.mapContacts(contacts, "db") };
        if (isNotEmpty(errors)) {
            output.metadata = {};
            output.metadata.errors = errors;
        }

        return new Success(ctx, output).send();
    }

    // Create contacts directly in the native macOS Address Book (Contacts.app), which
    // iCloud-syncs to all the user's devices. Idempotent: skips entries whose phone or
    // email already exists in the user's Contacts. Used by the auto-Contact-creation
    // pipeline so every new iMessage sender becomes a CRM lead with iCloud sync.
    //
    // Body: { firstName, lastName?, phoneNumbers?: string[], emails?: string[] } or array.
    static async createNative(ctx: RouterContext, _: Next) {
        let { body } = ctx.request;
        if (typeof body === "object" && !Array.isArray(body)) body = [body];

        const results: any[] = [];
        for (const item of body) {
            const firstName = item?.firstName ?? item?.displayName ?? '';
            if (!firstName) {
                results.push({ entry: item, ok: false, error: "firstName required" });
                continue;
            }
            const phoneNumbers: string[] = (item?.phoneNumbers ?? []).map((p: any) =>
                typeof p === "string" ? p : (p?.address ?? p?.value)
            ).filter(Boolean);
            const emails: string[] = (item?.emails ?? []).map((e: any) =>
                typeof e === "string" ? e : (e?.address ?? e?.value)
            ).filter(Boolean);

            const r = await ContactsLib.addNativeContactIfMissing({
                firstName,
                lastName: item?.lastName ?? '',
                phoneNumbers,
                emails
            });
            results.push({ entry: item, ...r });
        }

        return new Success(ctx, { data: results }).send();
    }
}
