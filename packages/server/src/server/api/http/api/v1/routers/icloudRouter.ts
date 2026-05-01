import { Next } from "koa";
import { RouterContext } from "koa-router";
import { Success } from "../responses/success";
import { BadRequest, NotImplemented, ServerError } from "../responses/errors";
import { HelperFeatureUnsupportedError, iCloudInterface } from "@server/api/interfaces/iCloudInterface";

export class iCloudRouter {
    static async getAccountInfo(ctx: RouterContext, _: Next) {
        try {
            const data: any = await iCloudInterface.getAccountInfo();
            return new Success(ctx, { message: "Successfully fetched account info!", data }).send();
        } catch (ex: any) {
            throw new ServerError({ message: "Failed to fetch account info!", error: ex?.message ?? ex.toString() });
        }
    }

    static async getContactCard(ctx: RouterContext, _: Next) {
        try {
            const { address } = ctx.request.query;
            const data: any = await iCloudInterface.getContactCard(address as string);
            return new Success(ctx, { message: "Successfully fetched contact card!", data }).send();
        } catch (ex: any) {
            throw new ServerError({ message: "Failed to fetch contact card!", error: ex?.message ?? ex.toString() });
        }
    }

    static async changeAlias(ctx: RouterContext, _: Next) {
        try {
            const { alias } = ctx?.request?.body ?? {};
            const data: any = await iCloudInterface.modifyActiveAlias(alias);
            return new Success(ctx, { message: "Successfully changed iMessage Alias!", data }).send();
        } catch (ex: any) {
            throw new ServerError({ message: "Failed to change iMessage Alias", error: ex?.message ?? ex.toString() });
        }
    }

    static async setShareNameProfile(ctx: RouterContext, _: Next) {
        const { displayName, avatarUrl } = (ctx?.request?.body ?? {}) as {
            displayName?: string;
            avatarUrl?: string;
        };

        if (!displayName || typeof displayName !== "string") {
            throw new BadRequest({
                message: "displayName is required",
                error: "Body must include a non-empty `displayName` string"
            });
        }

        try {
            await iCloudInterface.setShareNameProfile(displayName, avatarUrl ?? null);
            return new Success(ctx, {
                message: "Successfully set Share Name and Photo!",
                data: { displayName, avatarUrl: avatarUrl ?? null }
            }).send();
        } catch (ex: any) {
            if (ex instanceof HelperFeatureUnsupportedError) {
                throw new NotImplemented({
                    message: "Share Name and Photo write is not yet supported by BlueBubblesHelper",
                    error: ex.message,
                    data: { feature: ex.feature }
                });
            }
            throw new ServerError({
                message: "Failed to set Share Name and Photo",
                error: ex?.message ?? ex.toString()
            });
        }
    }
}
