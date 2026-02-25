/**
 * SUVIDHA Kiosk - Offline Store
 * Phase 0: Foundation & Architecture Alignment (FR-OFF-001, FR-OFF-002)
 *
 * Zustand store slice for offline/sync state.
 * Acts as the React-facing bridge for OfflineManager events.
 *
 * Sync queue data is persisted in localStorage via SyncQueueService.
 * This store holds the LIVE state view only — it reads from SyncQueueService for initial load.
 */

import { create } from 'zustand';
import { SyncQueueService } from '../core/offline/SyncQueueService';

export const useOfflineStore = create((set, get) => ({
    /** Current network status */
    networkStatus: navigator.onLine ? 'online' : 'offline',

    /** Whether sync is currently running */
    isSyncing: false,

    /** Live sync queue items (mirrors localStorage via SyncQueueService) */
    syncQueue: SyncQueueService.getAll(),

    /** Queue stats summary */
    syncStats: SyncQueueService.getStats(),

    /** Last successful sync timestamp */
    lastSyncAt: null,

    // ─── Setters ───────────────────────────────────────────────────────────────

    /**
     * Update network status — called by NetworkStatusProvider
     * when OfflineManager emits a status change.
     * @param {'online'|'offline'|'syncing'|'retrying'} status
     */
    setNetworkStatus(status) {
        set({ networkStatus: status });
        if (status === 'online') {
            set({ lastSyncAt: Date.now() });
        }
        set({ isSyncing: status === 'syncing' });
    },

    /**
     * Clear all items from the sync queue local storage.
     */
    clearQueue() {
        SyncQueueService.clearAll();
        get().refreshQueue();
    },

    /**
     * Refresh the sync queue view from persistent storage.
     * Call this after any enqueue/remove/status-update operation.
     */
    refreshQueue() {
        const queue = SyncQueueService.getAll();
        const stats = SyncQueueService.getStats();
        set({ syncQueue: queue, syncStats: stats });
    },

    /**
     * Enqueue a new offline operation and refresh view.
     * @param {object} params - see SyncQueueService.enqueue
     * @returns {string|null} queue item id
     */
    enqueue(params) {
        const id = SyncQueueService.enqueue(params);
        get().refreshQueue();
        return id;
    },

    /**
     * Get current pending count for badge/indicator display.
     * @returns {number}
     */
    getPendingCount() {
        const { syncStats } = get();
        return (syncStats.pending || 0) + (syncStats.retrying || 0);
    },
}));
