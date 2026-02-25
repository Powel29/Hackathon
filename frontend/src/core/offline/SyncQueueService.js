/**
 * SUVIDHA Kiosk - Sync Queue Service
 * Phase 0: Foundation & Architecture Alignment (FR-OFF-002, FR-OFF-003)
 *
 * Manages the persistent offline transaction queue.
 * Queue survives tab close/reopen via localStorage.
 * PII is never stored — payloads are sanitized before enqueue.
 *
 * Lifecycle of a queue item:
 *
 *   [User submits form] ──offline──► [QUEUED] ──reconnect──► [RETRYING]
 *                                       │                         │
 *                                       │                    success │ fail (max attempts)
 *                                       │                         ▼         ▼
 *                                       └──────────────────► [SYNCED]  [FAILED]
 */


import {
    QUEUE_ELIGIBLE_OPERATIONS,
    CONFLICT_POLICIES,
    RETRY_CONFIG,
    QUEUE_STATUS,
    computeNextRetry,
} from './queue.types';
import { STORAGE_KEYS, sanitizeForStorage } from '../security/storagePolicy';

// ─── SyncQueueService ────────────────────────────────────────────────────────

export const SyncQueueService = {
    /**
     * Load queue from localStorage.
     * @returns {Array} queue items
     */
    loadQueue() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.warn('[SyncQueue] Failed to parse stored queue — resetting:', e);
            localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
            return [];
        }
    },

    /**
     * Persist queue to localStorage.
     * @param {Array} queue
     */
    saveQueue(queue) {
        try {
            localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
        } catch (e) {
            console.error('[SyncQueue] Failed to persist queue:', e);
        }
    },

    /**
     * Add a new item to the sync queue.
     * Only QUEUE_ELIGIBLE_OPERATIONS are accepted.
     * Payload is sanitized of PII before storage.
     *
     * @param {object} params
     * @param {string} params.operationType
     * @param {Record<string, unknown>} params.payload - form data to queue
     * @param {string} [params.idempotencyKey] - optional idempotency key for dedup
     * @param {Function} [params.apiCall] - async function to call when syncing
     * @returns {string | null} queue item id if accepted, null if rejected
     */
    enqueue({ operationType, payload, idempotencyKey, apiCall }) {
        if (!QUEUE_ELIGIBLE_OPERATIONS.includes(operationType)) {
            console.warn(`[SyncQueue] Operation "${operationType}" is not queue-eligible.`);
            return null;
        }

        const queue = this.loadQueue();
        const id = crypto.randomUUID();
        const item = {
            id,
            idempotencyKey: idempotencyKey || crypto.randomUUID(),
            operationType,
            payload: sanitizeForStorage(payload || {}),
            // apiCall functions cannot be serialized — store operation type only.
            // SyncQueueService resolves the actual call via operationType at sync time.
            status: QUEUE_STATUS.QUEUED,
            conflictPolicy: CONFLICT_POLICIES[operationType] || 'server-authoritative',
            attempts: 0,
            nextRetryAt: Date.now(),
            createdAt: Date.now(),
            lastError: null,
        };

        queue.push(item);
        this.saveQueue(queue);

        console.info(`[SyncQueue] ⏳ Enqueued: ${operationType} (id: ${id})`);
        return id;
    },

    /**
     * Update the status of a queue item.
     * @param {string} id
     * @param {string} status - one of QUEUE_STATUS values
     * @param {object} [extra] - additional fields to merge (e.g., lastError)
     */
    updateStatus(id, status, extra = {}) {
        const queue = this.loadQueue();
        const idx = queue.findIndex(item => item.id === id);
        if (idx === -1) return;
        queue[idx] = { ...queue[idx], status, ...extra };
        this.saveQueue(queue);
    },

    /**
     * Remove a specific item from the queue (after successful sync).
     * @param {string} id
     */
    remove(id) {
        const queue = this.loadQueue().filter(item => item.id !== id);
        this.saveQueue(queue);
    },

    /**
     * Get all items currently in the queue.
     * @returns {Array}
     */
    getAll() {
        return this.loadQueue();
    },

    /**
     * Get only items that are ready to be retried (nextRetryAt <= now).
     * @returns {Array}
     */
    getPendingRetries() {
        const now = Date.now();
        return this.loadQueue().filter(
            item =>
                (item.status === QUEUE_STATUS.QUEUED || item.status === QUEUE_STATUS.RETRYING) &&
                item.nextRetryAt <= now
        );
    },

    /**
     * Mark an item as failed (max attempts exceeded).
     * @param {string} id
     * @param {string} errorMessage
     */
    markFailed(id, errorMessage) {
        this.updateStatus(id, QUEUE_STATUS.FAILED, { lastError: errorMessage });
        console.error(`[SyncQueue] ❌ Item permanently failed: ${id} — ${errorMessage}`);
    },

    /**
     * Schedule a retry for a failed item.
     * @param {string} id
     * @param {number} attempt - current attempt count
     */
    scheduleRetry(id, attempt) {
        if (attempt >= RETRY_CONFIG.maxAttempts) {
            this.markFailed(id, `Max retry attempts (${RETRY_CONFIG.maxAttempts}) exceeded.`);
            return false;
        }
        const nextRetryAt = computeNextRetry(attempt);
        this.updateStatus(id, QUEUE_STATUS.RETRYING, {
            attempts: attempt + 1,
            nextRetryAt,
        });
        return true;
    },

    /**
     * Compute queue statistics for UI display.
     * @returns {{ pending: number, retrying: number, synced: number, failed: number, total: number }}
     */
    getStats() {
        const queue = this.loadQueue();
        return {
            pending: queue.filter(i => i.status === QUEUE_STATUS.QUEUED).length,
            retrying: queue.filter(i => i.status === QUEUE_STATUS.RETRYING).length,
            synced: queue.filter(i => i.status === QUEUE_STATUS.SYNCED).length,
            failed: queue.filter(i => i.status === QUEUE_STATUS.FAILED).length,
            total: queue.length,
        };
    },

    /**
     * Clear all completed (synced) items from the queue.
     * Housekeeping — call periodically.
     */
    clearSynced() {
        const queue = this.loadQueue().filter(i => i.status !== QUEUE_STATUS.SYNCED);
        this.saveQueue(queue);
    },
};
