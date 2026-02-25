/**
 * SUVIDHA Kiosk - Network Status Provider
 * Phase 0: Foundation & Architecture Alignment (FR-OFF-001)
 *
 * React context provider that:
 *   1. Initializes and owns the OfflineManager singleton
 *   2. Bridges network status changes into Zustand store
 *   3. Exposes useNetworkStatus() hook for components
 *
 * Must wrap the entire app (outermost provider).
 */

import { createContext, useContext, useEffect, useRef } from 'react';
import { OfflineManager } from '../core/offline/OfflineManager';
import { useOfflineStore } from '../store/useOfflineStore';
import { isFeatureEnabled } from '../config/featureFlags';
import { offlineApiResolvers } from '../core/offline/apiResolvers';

const NetworkStatusContext = createContext(null);

export function NetworkStatusProvider({ children }) {
    const setNetworkStatus = useOfflineStore(s => s.setNetworkStatus);
    const refreshQueue = useOfflineStore(s => s.refreshQueue);
    const offlineEnabled = isFeatureEnabled('offlineQueue');
    const unsubscribeRef = useRef(null);

    useEffect(() => {
        if (!offlineEnabled) return;

        // Register resolvers before init so any immediate sync has access to them
        OfflineManager.setApiResolvers(offlineApiResolvers);

        // Init OfflineManager singleton
        OfflineManager.init();

        // Subscribe to status changes → update Zustand store
        unsubscribeRef.current = OfflineManager.subscribe((newStatus) => {
            setNetworkStatus(newStatus);
            // When we go online/synced, refresh queue view
            if (newStatus === 'online' || newStatus === 'syncing') {
                refreshQueue();
            }
        });

        // Set initial status
        setNetworkStatus(OfflineManager.status);

        return () => {
            if (unsubscribeRef.current) unsubscribeRef.current();
            // Don't destroy — singleton persists for SPA lifetime
        };
    }, [offlineEnabled, setNetworkStatus, refreshQueue]);

    return (
        <NetworkStatusContext.Provider value={OfflineManager}>
            {children}
        </NetworkStatusContext.Provider>
    );
}

/**
 * Hook to access the current network status.
 * @returns {{ status: string, isOnline: boolean, isOffline: boolean, isSyncing: boolean, triggerSync: Function }}
 */
export function useNetworkStatus() {
    const status = useOfflineStore(s => s.networkStatus);
    return {
        status,
        isOnline: status === 'online',
        isOffline: status === 'offline',
        isSyncing: status === 'syncing' || status === 'retrying',
        triggerSync: () => OfflineManager.triggerManualSync(),
    };
}
