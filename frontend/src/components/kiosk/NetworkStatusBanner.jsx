/**
 * NetworkStatusBanner — Phase 1: Touch UX + FR-OFF-001
 *
 * Persistent banner that shows current network status.
 * Appears at the top of the KioskLayout when offline/syncing/retrying.
 * Always visible when NOT online — auto-hides when stable online.
 *
 * States: online (hidden) | offline | syncing | retrying
 */

import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { useNetworkStatus } from '../../providers/NetworkStatusProvider';
import { useOfflineStore } from '../../store/useOfflineStore';
import { useTranslation } from 'react-i18next';

const STATUS_CONFIG = {
    online: { icon: Wifi, color: '#16a34a', bg: '#f0fdf4', borderColor: '#bbf7d0', hidden: true },
    offline: { icon: WifiOff, color: '#dc2626', bg: '#fef2f2', borderColor: '#fecaca', hidden: false },
    syncing: { icon: RefreshCw, color: '#2563eb', bg: '#eff6ff', borderColor: '#bfdbfe', hidden: false },
    retrying: { icon: AlertTriangle, color: '#d97706', bg: '#fffbeb', borderColor: '#fde68a', hidden: false },
};

export function NetworkStatusBanner({ onOpenQueue }) {
    const { status, triggerSync } = useNetworkStatus();
    const pendingCount = useOfflineStore(s => s.getPendingCount());
    const { t } = useTranslation();

    const config = STATUS_CONFIG[status] || STATUS_CONFIG.online;

    // Don't render when online and no pending items
    if (config.hidden && pendingCount === 0) return null;

    const Icon = config.icon;

    const messages = {
        online: t('network.online', 'Connected'),
        offline: t('network.offline', 'You are offline. Actions will be saved and synced later.'),
        syncing: t('network.syncing', 'Syncing your queued actions...'),
        retrying: t('network.retrying', 'Retrying failed sync. Please wait...'),
    };

    return (
        <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium select-none"
            style={{
                backgroundColor: config.bg,
                borderBottom: `2px solid ${config.borderColor}`,
                color: config.color,
            }}
        >
            <Icon
                className={`w-5 h-5 flex-shrink-0 ${status === 'syncing' ? 'animate-spin' : ''}`}
                aria-hidden="true"
            />
            <span className="flex-1">{messages[status]}</span>

            {pendingCount > 0 && (
                <div className="flex items-center gap-2">
                    <span className="bg-white bg-opacity-60 px-2 py-0.5 rounded-full text-xs font-bold">
                        {pendingCount} pending
                    </span>
                    <button
                        onClick={onOpenQueue}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-white bg-opacity-80 hover:bg-opacity-100 transition-colors"
                        style={{ color: config.color, touchAction: 'manipulation' }}
                    >
                        {t('network.viewQueue', 'View Queue')}
                    </button>
                </div>
            )}

            {(status === 'offline' || status === 'retrying') && (
                <button
                    onClick={triggerSync}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-white bg-opacity-80 hover:bg-opacity-100 transition-colors border border-current border-opacity-20"
                    style={{ color: config.color, touchAction: 'manipulation' }}
                    aria-label={t('network.retryNow', 'Retry now')}
                >
                    {t('network.retryNow', 'Retry Now')}
                </button>
            )}
        </div>
    );
}
