/**
 * NextGen Seva Kiosk - Offline Manager
 * Phase 0: Foundation & Architecture Alignment (FR-OFF-001, FR-OFF-002, FR-OFF-004)
 *
 * Singleton manager that:
 *   1. Listens to browser online/offline events
 *   2. Does periodic health pings to confirm real connectivity
 *   3. Triggers sync queue processing when online
 *   4. Notifies React store about network status changes
 *
 * This is a plain JS class (not React) — imported by NetworkStatusProvider.
 *
 * Network Status State Machine:
 *
 *  ┌─────────┐  disconnect   ┌─────────┐
 *  │ online  │ ─────────────►│ offline │
 *  └────┬────┘               └────┬────┘
 *       │◄─── ping succeeds ──────┘
 *       │
 *       │  sync starts
 *       ▼
 *  ┌──────────┐  sync complete ┌────────────┐
 *  │ syncing  │ ──────────────►│  online    │
 *  └────┬─────┘                └────────────┘
 *       │ retry in progress
 *       ▼
 *  ┌──────────┐
 *  │ retrying │
 *  └──────────┘
 */

import { SyncQueueService } from './SyncQueueService';

const PING_INTERVAL_MS = 15000;  // 15s passive recheck interval

class OfflineManagerClass {
    constructor() {
        this._status = navigator.onLine ? 'online' : 'offline';
        this._listeners = new Set();      // status change callbacks
        this._pingInterval = null;
        this._syncTimer = null;
        this._initialized = false;
    }

    /**
     * Initialize the manager — attach event listeners.
     * Call once at app boot inside NetworkStatusProvider.
     */
    init() {
        if (this._initialized) return;
        this._initialized = true;

        window.addEventListener('online', this._handleOnline.bind(this));
        window.addEventListener('offline', this._handleOffline.bind(this));

        // Passive recheck using navigator.onLine every 15s
        this._pingInterval = setInterval(
            this._healthPing.bind(this),
            PING_INTERVAL_MS
        );

        // Set initial status
        this._setStatus(navigator.onLine ? 'online' : 'offline');

        console.info('[OfflineManager] Initialized. Status:', this._status);
    }

    /**
     * Tear down listeners (on app unmount).
     */
    destroy() {
        window.removeEventListener('online', this._handleOnline.bind(this));
        window.removeEventListener('offline', this._handleOffline.bind(this));
        if (this._pingInterval) clearInterval(this._pingInterval);
        if (this._syncTimer) clearTimeout(this._syncTimer);
        this._initialized = false;
    }

    /**
     * Current network status.
     * @returns {'online'|'offline'|'syncing'|'retrying'}
     */
    get status() {
        return this._status;
    }

    /**
     * Register a callback to be called when status changes.
     * @param {Function} cb - (newStatus: string) => void
     * @returns {Function} unsubscribe function
     */
    subscribe(cb) {
        this._listeners.add(cb);
        return () => this._listeners.delete(cb);
    }

    // ─── Private ───────────────────────────────────────────────────────────────

    _setStatus(newStatus) {
        if (this._status === newStatus) return;
        const prev = this._status;
        this._status = newStatus;
        console.info(`[OfflineManager] ${prev} → ${newStatus}`);
        this._listeners.forEach(cb => {
            try { cb(newStatus); } catch (_) { /* listener errors must not crash manager */ }
        });
    }

    _handleOnline() {
        // Browser says online — verify with a real ping before declaring online
        this._healthPing();
    }

    _handleOffline() {
        this._setStatus('offline');
    }

    async _healthPing() {
        // Simple navigator.onLine check — avoids CORS issues with direct fetch.
        // Browser online/offline events already cover the main cases.
        // A proper API-level health check will be wired in Phase 6 via axios.
        const isOnline = navigator.onLine;
        if (!isOnline && this._status !== 'retrying') {
            this._setStatus('offline');
            return;
        }
        // If we think we're offline but navigator.onLine is now true, try sync
        if (isOnline && this._status === 'offline') {
            this._triggerSync();
        }
    }

    /**
     * Trigger sync queue processing.
     * Processes all pending items with exponential backoff per item.
     * Registered API call resolvers are wired in via setApiResolvers().
     */
    async _triggerSync() {
        const pending = SyncQueueService.getPendingRetries();
        if (pending.length === 0) {
            this._setStatus('online');
            return;
        }

        this._setStatus('syncing');
        console.info(`[OfflineManager] 🔄 Syncing ${pending.length} queued item(s)...`);

        let anyFailed = false;

        for (const item of pending) {
            try {
                const resolver = this._apiResolvers?.[item.operationType];
                if (!resolver) {
                    console.warn(`[OfflineManager] No resolver for operation: ${item.operationType}`);
                    SyncQueueService.scheduleRetry(item.id, item.attempts);
                    anyFailed = true;
                    continue;
                }

                await resolver(item.payload, item.idempotencyKey);
                SyncQueueService.remove(item.id);
                console.info(`[OfflineManager] ✅ Synced: ${item.operationType} (${item.id})`);
            } catch (err) {
                const canRetry = SyncQueueService.scheduleRetry(item.id, item.attempts);
                if (!canRetry) {
                    console.error(`[OfflineManager] ❌ Permanently failed: ${item.id}`);
                }
                anyFailed = true;
            }
        }

        if (anyFailed) {
            this._setStatus('retrying');
            // Schedule another sync pass after the shortest next retry window
            const nextItems = SyncQueueService.getPendingRetries();
            if (nextItems.length > 0) {
                const soonest = Math.min(...nextItems.map(i => i.nextRetryAt));
                const delay = Math.max(soonest - Date.now(), 1000);
                this._syncTimer = setTimeout(() => this._triggerSync(), delay);
            }
        } else {
            this._setStatus('online');
            SyncQueueService.clearSynced();
        }
    }

    /**
     * Register API call resolvers for each operation type.
     * Called by NetworkStatusProvider once API services are available.
     * @param {Record<string, Function>} resolvers - { [operationType]: async (payload, idempotencyKey) => void }
     */
    setApiResolvers(resolvers) {
        this._apiResolvers = resolvers;
    }

    /**
     * Manually trigger a sync attempt (e.g., when user taps "Retry Now").
     */
    triggerManualSync() {
        if (this._status === 'offline') {
            this._healthPing();
        } else {
            this._triggerSync();
        }
    }
}

// Export as singleton
export const OfflineManager = new OfflineManagerClass();
