/**
 * SUVIDHA Kiosk - Offline API Resolvers
 * Phase 2: Offline Transaction Sync (FR-OFF-002)
 *
 * This file maps queue operation types to their actual API calls.
 * Used by OfflineManager to process the sync queue.
 */
import { complaintService, connectionService } from '../../services/api';
import { serviceRequestService } from '../../services/api/serviceRequest.service';

export const offlineApiResolvers = {
    /**
     * Resolver for 'complaint' operation.
     * @param {Object} payload The sanitized complaint data
     * @param {string} idempotencyKey Unique key to prevent duplicate creation on retry
     */
    complaint: async (payload, idempotencyKey) => {
        await complaintService.submit({
            ...payload,
            _idempotencyKey: idempotencyKey
        });
    },

    connection_req: async (payload, idempotencyKey) => {
        await connectionService.requestNew({
            ...payload,
            _idempotencyKey: idempotencyKey
        });
    },

    tanker_booking: async (payload, idempotencyKey) => {
        await serviceRequestService.create({
            ...payload,
            _idempotencyKey: idempotencyKey
        });
    },

    gas_booking: async (payload, idempotencyKey) => {
        await serviceRequestService.create({
            ...payload,
            _idempotencyKey: idempotencyKey
        });
    },
};
