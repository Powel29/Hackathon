/**
 * SyncQueuePanel — Phase 2: UI-DES-005, UI-DES-010
 *
 * Slide-in panel to view and manage the offline sync queue.
 * Accessible from the KioskLayout footer or NetworkStatusBanner.
 *
 * Displays:
 * - Queue stats (Pending, Synced, Failed)
 * - List of items with their status and operation type
 * - "Retry Now" global trigger
 * - Per-item status indicators
 */

import { X, RefreshCw, Trash2, Clock, AlertCircle, CheckCircle, Database } from 'lucide-react';
import { useOfflineStore } from '../../store/useOfflineStore';
import { useNetworkStatus } from '../../providers/NetworkStatusProvider';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';

export function SyncQueuePanel({ isOpen, onClose }) {
    const { t } = useTranslation();
    const panelRef = useRef(null);
    const { syncQueue, syncStats, clearQueue, refreshQueue, isSyncing } = useOfflineStore();
    const { triggerSync } = useNetworkStatus();

    // Focus trap + Escape to close
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        panelRef.current?.focus();

        // Refresh queue data whenever panel opens
        refreshQueue();

        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose, refreshQueue]);

    if (!isOpen) return null;

    const getStatusIcon = (status) => {
        switch (status) {
            case 'queued': return <Clock className="w-4 h-4 text-orange-500" />;
            case 'retrying': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
            case 'synced': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return null;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'queued': return t('offline.status.queued', 'Queued');
            case 'retrying': return t('offline.status.retrying', 'Retrying');
            case 'synced': return t('offline.status.synced', 'Synced');
            case 'failed': return t('offline.status.failed', 'Failed');
            default: return status;
        }
    };

    const formatTime = (ts) => {
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-40 z-40"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={t('offline.syncQueue', 'Sync Queue')}
                tabIndex={-1}
                className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <Database className="w-6 h-6 text-[#0066CC]" />
                        <h2 className="text-xl font-bold text-[#212529]">
                            {t('offline.syncQueue', 'Offline Queue')}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
                        style={{ touchAction: 'manipulation' }}
                        aria-label={t('common.close', 'Close')}
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 space-y-6 overflow-y-auto">

                    {/* Stats Summary */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl text-center">
                            <p className="text-2xl font-bold text-orange-600">{syncStats.pending + syncStats.retrying}</p>
                            <p className="text-[10px] uppercase font-bold text-orange-800">{t('offline.pending', 'Pending')}</p>
                        </div>
                        <div className="bg-green-50 border border-green-100 p-3 rounded-xl text-center">
                            <p className="text-2xl font-bold text-green-600">{syncStats.synced}</p>
                            <p className="text-[10px] uppercase font-bold text-green-800">{t('offline.synced', 'Synced')}</p>
                        </div>
                        <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-center">
                            <p className="text-2xl font-bold text-red-600">{syncStats.failed}</p>
                            <p className="text-[10px] uppercase font-bold text-red-800">{t('offline.failed', 'Failed')}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={triggerSync}
                            disabled={isSyncing}
                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#0066CC] text-white rounded-xl font-bold hover:bg-[#0052A3] disabled:opacity-50 transition-all min-h-[56px]"
                            style={{ touchAction: 'manipulation' }}
                        >
                            <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? t('offline.syncing', 'Syncing...') : t('offline.retryNow', 'Retry Now')}
                        </button>
                        <button
                            onClick={() => {
                                if (window.confirm(t('offline.confirmClear', 'Clear all items from queue?'))) {
                                    clearQueue();
                                }
                            }}
                            className="w-14 flex items-center justify-center bg-gray-100 text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all min-h-[56px]"
                            style={{ touchAction: 'manipulation' }}
                            aria-label={t('offline.clearQueue', 'Clear Queue')}
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Queue List */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">
                            {t('offline.recentActivity', 'Recent Activity')}
                        </h3>

                        {syncQueue.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600">{t('offline.queueEmpty', 'No pending operations')}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {[...syncQueue].reverse().map((item) => (
                                    <div
                                        key={item.id}
                                        className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm hover:border-gray-300 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(item.status)}
                                                <span className="font-bold text-[#212529] capitalize">
                                                    {item.operationType.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                {formatTime(item.createdAt)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between mt-3 text-xs">
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-full text-gray-500">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                                {getStatusLabel(item.status)}
                                            </div>
                                            {item.attempts > 0 && (
                                                <span className="text-gray-400 italic">
                                                    {t('offline.attempts', 'Attempt')} {item.attempts}
                                                </span>
                                            )}
                                        </div>

                                        {item.status === 'failed' && item.lastError && (
                                            <div className="mt-3 p-2 bg-red-50 text-red-600 rounded text-[10px] leading-relaxed">
                                                {item.lastError}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Notice */}
                <div className="p-6 border-t border-gray-200">
                    <div className="flex gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                        <p className="text-xs text-blue-800 leading-relaxed">
                            {t('offline.queueNote', 'Operations queued while offline will automatically sync once a stable connection is detected. Manual retry triggers an immediate health check.')}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
