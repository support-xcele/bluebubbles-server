import { Server } from "@server";
import fs from "fs";
import os from "os";
import path from "path";
import https from "https";
import http from "http";
import crypto from "crypto";
import { isMinBigSur, isMinHighSierra } from "@server/env";
import { checkPrivateApiStatus, isNotEmpty } from "@server/helpers/utils";
import { bytesToBase64 } from "byte-base64";

/**
 * Sentinel class so the HTTP router can map this case to a 501 response
 * without parsing message strings.
 */
export class HelperFeatureUnsupportedError extends Error {
    feature: string;

    constructor(feature: string, message?: string) {
        super(message ?? `BlueBubblesHelper does not implement: ${feature}`);
        this.name = "HelperFeatureUnsupportedError";
        this.feature = feature;
    }
}

export class iCloudInterface {
    static async getAccountInfo() {
        checkPrivateApiStatus();
        if (!isMinHighSierra) {
            throw new Error("This API is only available on macOS Big Sur and newer!");
        }

        const data = await Server().privateApi.cloud.getAccountInfo();
        return data.data;
    }

    static async getContactCard(address: string = null, loadAvatar = true) {
        checkPrivateApiStatus();
        if (!isMinBigSur) {
            throw new Error("This API is only available on macOS Monterey and newer!");
        }

        const data = await Server().privateApi.cloud.getContactCard(address);
        const avatarPath = data?.data?.avatar_path;
        if (isNotEmpty(avatarPath) && loadAvatar) {
            data.data.avatar = bytesToBase64(fs.readFileSync(avatarPath));
            delete data.data.avatar_path;
        }

        return data.data;
    }

    static async modifyActiveAlias(alias: string) {
        checkPrivateApiStatus();
        const accountInfo = await this.getAccountInfo();
        const aliases = (accountInfo.vetted_aliases ?? []).map((e: any) => e.Alias);
        if (!aliases.includes(alias)) {
            throw new Error(`Alias, "${alias}" is not assigned/enabled for your iCloud account!`);
        }

        await Server().privateApi.cloud.modifyActiveAlias(alias);
    }

    /**
     * Downloads a remote URL to a temp file and returns the local path.
     * Returns null if avatarUrl is empty.
     */
    private static async downloadAvatar(avatarUrl?: string | null): Promise<string | null> {
        if (!isNotEmpty(avatarUrl)) return null;

        const url = new URL(avatarUrl as string);
        if (url.protocol === "file:") {
            return decodeURIComponent(url.pathname);
        }
        if (url.protocol !== "http:" && url.protocol !== "https:") {
            throw new Error(`Unsupported avatarUrl protocol: ${url.protocol}`);
        }

        const tmpName = `bb-share-name-avatar-${crypto.randomBytes(8).toString("hex")}`;
        const tmpPath = path.join(os.tmpdir(), tmpName);
        const transport = url.protocol === "https:" ? https : http;

        await new Promise<void>((resolve, reject) => {
            const file = fs.createWriteStream(tmpPath);
            transport
                .get(url.toString(), res => {
                    if (res.statusCode && res.statusCode >= 400) {
                        file.close();
                        fs.unlink(tmpPath, () => {
                            /* swallow */
                        });
                        reject(new Error(`Failed to download avatar: HTTP ${res.statusCode}`));
                        return;
                    }
                    res.pipe(file);
                    file.on("finish", () => file.close(() => resolve()));
                })
                .on("error", err => {
                    fs.unlink(tmpPath, () => {
                        /* swallow */
                    });
                    reject(err);
                });
        });

        return tmpPath;
    }

    /**
     * Sets the active iMessage account's "Share Name and Photo" profile
     * (Apple's IMShareNameProfile / IMNicknameController).
     *
     * GAP: BlueBubblesHelper.dylib v1.9.9 does NOT yet expose a
     * "set-nickname-info" command. The dylib needs a new hook in
     * BlueBubblesApp/bluebubbles-server-helper that:
     *   1. Builds an IMShareNameProfile from displayName + avatar bytes.
     *   2. Calls IMNicknameController.sharedController to set it as the
     *      active sharing profile.
     *   3. Persists via the existing nickname store so Messages.app picks
     *      it up on restart.
     *
     * Until that ships, this method always throws HelperFeatureUnsupportedError
     * so the HTTP layer can return 501 instead of silently 200-ing.
     */
    static async setShareNameProfile(displayName: string, avatarUrl?: string | null) {
        checkPrivateApiStatus();
        if (!isMinBigSur) {
            throw new Error("This API is only available on macOS Big Sur and newer!");
        }

        if (!isNotEmpty(displayName)) {
            throw new Error("displayName is required");
        }

        // The "set-nickname-info" action is implemented in our forked helper
        // dylib at support-xcele/bluebubbles-helper (PR #1, branch
        // feature/set-nickname-info; upstream proposal:
        // BlueBubblesApp/bluebubbles-helper#57). Once the dylib has been
        // rebuilt from that branch and dropped at
        //   /Applications/BlueBubbles.app/Contents/Resources/appResources/private-api/macos11/BlueBubblesHelper.dylib
        // set BB_HELPER_SUPPORTS_SET_NICKNAME=true in the BB server env to
        // flip this gate. Sourced from env so QA can opt in without
        // recompiling once a custom dylib is dropped in.
        const helperSupportsSetNickname =
            process.env.BB_HELPER_SUPPORTS_SET_NICKNAME === "true";
        if (!helperSupportsSetNickname) {
            throw new HelperFeatureUnsupportedError(
                "set-nickname-info",
                "BlueBubblesHelper.dylib does not yet implement Share Name and Photo writes. " +
                    "A new hook calling IMNicknameController/IMShareNameProfile must be added " +
                    "to the helper dylib before this endpoint can succeed."
            );
        }

        // The code below is the "happy path" that will run as soon as the
        // helper dylib supports set-nickname-info. Kept here so flipping the
        // flag is the only change needed once the dylib ships.
        let avatarPath: string | null = null;
        try {
            avatarPath = await this.downloadAvatar(avatarUrl);
            await Server().privateApi.cloud.setNicknameInfo(displayName, avatarPath);
        } finally {
            if (avatarPath && avatarPath.startsWith(os.tmpdir())) {
                fs.unlink(avatarPath, () => {
                    /* swallow */
                });
            }
        }
    }
}
