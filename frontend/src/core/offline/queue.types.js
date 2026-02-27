/**
 * NextGen Seva Kiosk - Offline Queue Type Definitions & Constants
 * Phase 0: Foundation & Architecture Alignment (FR-OFF-002)
 *
 * Shared constants used by OfflineManager and SyncQueueService.
 */

/**
 * All operation types that are eligible for offline queuing.
 * Payment operations are EXCLUDED — they are always online-only.
 */
export const QUEUE_ELIGIBLE_OPERATIONS = [
    'complaint',       // Register complaint
    'connection_req',  // New connection request
    'tanker_booking',  // Water tanker booking
    'gas_booking',     // Gas cylinder booking
    'draft_update',    // Any form draft save
    'address_update',  // Profile address update
    'document_upload', // Document submission (queued, re-submitted on reconnect)
];

/**
 * Operation types that are NOT eligible for queuing.
 * These must always be performed online with immediate user feedback.
 */
export const ONLINE_ONLY_OPERATIONS = [
    'bill_payment',
    'otp_verify',
    'auth_login',
];

/**
 * Conflict resolution policies per operation type.
 * - 'last-write-wins': local data overwrites server (for drafts)
 * - 'server-authoritative': server response wins; user is notified of conflicts
 */
export const CONFLICT_POLICIES = {
    complaint: 'server-authoritative',
    connection_req: 'server-authoritative',
    tanker_booking: 'server-authoritative',
    gas_booking: 'server-authoritative',
    draft_update: 'last-write-wins',
    address_update: 'server-authoritative',
    document_upload: 'server-authoritative',
};

/**
 * Retry strategy — exponential backoff configuration.
 */
export const RETRY_CONFIG = {
    /** Max number of retry attempts before marking as 'failed' */
    maxAttempts: 5,
    /** Base delay in ms (doubles each retry) */
    baseDelayMs: 5001,
    /** Cap: max delay between retries */
    maxDelayMs: 120000, // 2 minutes
};

/**
 * Compute the next retry timestamp using exponential backoff.
 * @param {number} attempt - zero-indexed attempt number
 * @returns {number} timestamp (ms from epoch) when to retry next
 */
export function computeNextRetry(attempt) {
    const delay = Math.min(
        RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt),
        RETRY_CONFIG.maxDelayMs
    );
    // Add ±20% jitter to prevent thundering herd
    const jitter = delay * 0.2 * (Math.random() - 0.5);
    return Date.now() + delay + jitter;
}

/**
 * SyncQueue item status values.
 * Must match networkState tokens in designTokens.js.
 */
export const QUEUE_STATUS = {
    QUEUED: 'queued',
    RETRYING: 'retrying',
    SYNCED: 'synced',
    FAILED: 'failed',
};
