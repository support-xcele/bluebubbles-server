import { Server } from "@server";
import {
    TransactionPromise,
    TransactionResult,
    TransactionType
} from "@server/managers/transactionManager/transactionPromise";
import { PrivateApiAction } from ".";

export class PrivateApiHandle extends PrivateApiAction {
    tag = "PrivateApiHandle";

    async getFocusStatus(address: string): Promise<TransactionResult> {
        const action = "check-focus-status";
        this.throwForNoMissingFields(action, [address]);
        const request = new TransactionPromise(TransactionType.HANDLE);
        return this.sendApiMessage(action, { address }, request);
    }

    async getMessagesAvailability(address: string): Promise<TransactionResult> {
        const action = "check-imessage-availability";
        this.throwForNoMissingFields(action, [address]);
        const request = new TransactionPromise(TransactionType.HANDLE);
        const aliasType = address.includes("@") ? "email" : "phone";
        return this.sendApiMessage(action, { aliasType, address }, request);
    }

    async getFacetimeAvailability(address: string): Promise<TransactionResult> {
        const action = "check-facetime-availability";
        this.throwForNoMissingFields(action, [address]);
        const request = new TransactionPromise(TransactionType.HANDLE);
        const aliasType = address.includes("@") ? "email" : "phone";
        return this.sendApiMessage(action, { aliasType, address }, request);
    }

    /**
     * Block or unblock a contact by Apple-ID address / phone number — the
     * exact private API Messages.app's "Block Contact" toggles. Helper
     * dispatches via the `block-handle` event:
     *   data.address  required
     *   data.block    optional, default true
     * Helper replies with { isBlocked: <BOOL> } so the caller can confirm.
     */
    async setBlocked(address: string, block = true): Promise<TransactionResult> {
        const action = "block-handle";
        this.throwForNoMissingFields(action, [address]);
        const request = new TransactionPromise(TransactionType.HANDLE);
        return this.sendApiMessage(action, { address, block }, request);
    }
}
