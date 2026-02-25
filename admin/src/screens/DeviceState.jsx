import { useState, useEffect } from 'react';
import { Wifi, RefreshCcw, Database, Trash2, Clock, CheckCircle } from 'lucide-react';

export function DeviceState() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncQueue, setSyncQueue] = useState([]);

    const refreshQueue = () => {
        try {
            const raw = localStorage.getItem('suvidha_sync_queue');
            setSyncQueue(raw ? JSON.parse(raw) : []);
        } catch (e) {
            setSyncQueue([]);
        }
    };

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        refreshQueue();

        // Listen to storage events from other tabs (if same origin)
        const handleStorage = (e) => {
            if (e.key === 'suvidha_sync_queue') {
                refreshQueue();
            }
        };
        window.addEventListener('storage', handleStorage);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    const clearQueue = () => {
        localStorage.setItem('suvidha_sync_queue', JSON.stringify([]));
        refreshQueue();
    };

    const forceSync = () => {
        setIsSyncing(true);
        // This is a dummy sync for the admin portal since actual syncing happens on the Kiosk
        setTimeout(() => {
            setIsSyncing(false);
            refreshQueue();
        }, 1500);
    };

    const injectDemoData = () => {
        const demoQueue = [
            {
                id: crypto.randomUUID(),
                operationType: 'gas_booking',
                payload: { fullName: 'Test User', consumerId: '12345' },
                status: 'queued',
                attempts: 0,
                createdAt: Date.now(),
                lastError: null
            },
            {
                id: crypto.randomUUID(),
                operationType: 'new_connection',
                payload: { applicantName: 'John Doe' },
                status: 'retrying',
                attempts: 2,
                createdAt: Date.now() - 3600000,
                lastError: 'Network Timeout'
            }
        ];
        localStorage.setItem('suvidha_sync_queue', JSON.stringify(demoQueue));
        refreshQueue();
    };

    const syncStats = {
        pending: syncQueue.filter(i => i.status === 'queued').length,
        retrying: syncQueue.filter(i => i.status === 'retrying').length,
        synced: syncQueue.filter(i => i.status === 'synced').length,
        failed: syncQueue.filter(i => i.status === 'failed').length,
    };

    return (
        <div className="space-y-6">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Device State (Offline Sync)</h1>
                    <p className="page-subtitle">Monitor the local offline queue and sync metrics directly</p>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ padding: 12, borderRadius: 50, background: isOnline ? '#E8F5E9' : '#FFEBEE', color: isOnline ? '#2E7D32' : '#C62828' }}>
                        {isOnline ? <Wifi size={24} /> : <Wifi size={24} style={{ opacity: 0.3 }} />}
                    </div>
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Network Status</h3>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                            Currently <span style={{ fontWeight: 700, color: isOnline ? '#2E7D32' : '#C62828' }}>{isOnline ? 'Online' : 'Offline'}</span>
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        onClick={injectDemoData}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#F0F9FF', color: '#0369A1', border: '1px solid #BAE6FD', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                    >
                        <span>Inject Demo Data</span>
                    </button>
                    <button
                        onClick={forceSync}
                        disabled={isSyncing}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: isSyncing ? 'var(--bg-light)' : 'var(--primary)', color: isSyncing ? 'var(--text-muted)' : '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: isSyncing ? 'not-allowed' : 'pointer' }}
                    >
                        <RefreshCcw size={16} style={isSyncing ? { animation: 'spin 1s linear infinite' } : {}} />
                        <span>{isSyncing ? 'Syncing...' : 'Force Sync'}</span>
                    </button>
                    <button
                        onClick={clearQueue}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#FFEBEE', color: '#C62828', border: '1px solid #FFCDD2', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                    >
                        <Trash2 size={16} />
                        <span>Clear Queue</span>
                    </button>
                </div>
            </div>

            <div className="grid-4 grid">
                <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div className="stat-label">Pending Operations</div>
                    <div className="stat-value">{syncStats.pending}</div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid var(--warning)' }}>
                    <div className="stat-label">Retrying</div>
                    <div className="stat-value">{syncStats.retrying}</div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid var(--danger)' }}>
                    <div className="stat-label">Failed Syncs</div>
                    <div className="stat-value">{syncStats.failed}</div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
                    <div className="stat-label">Successfully Synced</div>
                    <div className="stat-value">{syncStats.synced}</div>
                </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Database size={18} color="var(--primary)" />
                        Local Sync Queue
                    </h3>
                    <span style={{ fontSize: 12, background: '#E0F2FE', color: '#0284C7', padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>
                        {syncQueue.length} Items in Queue
                    </span>
                </div>
                {syncQueue.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 16px' }} />
                        <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Queue is Empty</p>
                        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>All local transactions have been synced to the server.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#F8FAFC' }}>
                                <tr>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Queue ID</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Operation</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Created</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Retries</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Last Error</th>
                                </tr>
                            </thead>
                            <tbody>
                                {syncQueue.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '16px 20px', fontSize: 13, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                                            {item.id.substring(0, 8)}...
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <span style={{ padding: '4px 8px', background: '#F1F5F9', color: 'var(--text-primary)', borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                                                {item.operationType.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                                                background: item.status === 'queued' ? '#E0F2FE' : item.status === 'retrying' ? '#FEF3C7' : '#FEE2E2',
                                                color: item.status === 'queued' ? '#0284C7' : item.status === 'retrying' ? '#D97706' : '#DC2626'
                                            }}>
                                                {item.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Clock size={14} />
                                            {new Date(item.createdAt).toLocaleTimeString()}
                                        </td>
                                        <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--text-secondary)' }}>
                                            {item.attempts || 0} / 3
                                        </td>
                                        <td style={{ padding: '16px 20px', fontSize: 12, color: 'var(--danger)', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.lastError}>
                                            {item.lastError || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
