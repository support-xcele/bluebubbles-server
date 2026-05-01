import {
    TransactionPromise,
    TransactionResult,
    TransactionType
} from "@server/managers/transactionManager/transactionPromise";
import { PrivateApiAction } from ".";

export class PrivateApiCloud extends PrivateApiAction {
    tag = "PrivateApiCloud";

    async getAccountInfo(): Promise<TransactionResult> {
        const action = "get-account-info";
        const request = new TransactionPromise(TransactionType.OTHER);
        return this.sendApiMessage(action, null, request);
    }

    async getContactCard(address: string = null): Promise<TransactionResult> {
        const action = "get-nickname-info";
        const request = new TransactionPromise(TransactionType.OTHER);
        return this.sendApiMessage(action, { address }, request);
    }

    async modifyActiveAlias(alias: string): Promise<TransactionResult> {
        const action = "modify-active-alias";
        const request = new TransactionPromise(TransactionType.OTHER);
        return this.sendApiMessage(action, { alias }, request);
    }

    /**
     * Sets the local user's "Share Name and Photo" (IMShareNameProfile /
     * IMNicknameController) for the active iMessage account.
     *
     * NOTE: As of BlueBubblesHelper.dylib in v1.9.9 this command is NOT
     * implemented in the helper. The dylib only exposes:
     *   - get-account-info
     *   - get-nickname-info       (read self/contact card)
     *   - modify-active-alias
     *   - should-offer-nickname-sharing
     *   - share-nickname          (push current profile into a chat)
     *
     * There is no write/update path. Adding it requires a new hook in the
     * helper-dylib repo (BlueBubblesApp/bluebubbles-server-helper) that
     * calls into IMNicknameController to mutate the active IMShareNameProfile
     * (display name + avatar image data) and persist it.
     *
     * Once the dylib gains a "set-nickname-info" command, this method's
     * caller will succeed; until then the iCloudInterface short-circuits
     * with a 501.
     */
    async setNicknameInfo(displayName: string, avatarPath: string | null): Promise<TransactionResult> {
        const action = "set-nickname-info";
        this.throwForNoMissingFields(action, [displayName]);
        const request = new TransactionPromise(TransactionType.OTHER);
        return this.sendApiMessage(action, { displayName, avatarPath }, request);
    }
}
