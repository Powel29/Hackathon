import { useAdminStore } from '../store/adminStore';
import { Monitor, WifiOff, Activity } from 'lucide-react';
export function KioskMonitor() {
    const { kiosks } = useAdminStore();
    const online = kiosks.filter(k => k.status === 'online').length;
    const offline = kiosks.filter(k => k.status === 'offline').length;
    const maintenance = kiosks.filter(k => k.status === 'maintenance').length;
    const totalToday = kiosks.reduce((s, k) => s + k.todayCount, 0);
    const STATUS_COLORS = {
        online: { bg: '#E8F5E9', color: '#2E7D32', dot: 'var(--success)', label: '● Online' },
        offline: { bg: '#FFEBEE', color: '#C62828', dot: 'var(--danger)', label: '● Offline' },
        maintenance: { bg: '#FFF9C4', color: '#F57F17', dot: 'var(--warning)', label: '● Maintenance' },
    };
    const NETWORK_LABELS = { excellent: '🟢 Excellent', good: '🟡 Good', poor: '🔴 Poor' };
    const PRINTER_LABELS = { ok: '✅ OK', low_paper: '⚠️ Low Paper', error: '❌ Error' };
    return (<div className="space-y-4">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Kiosk Network Monitor</h1>
                    <p className="page-subtitle">Real-time status of all SUVIDHA kiosk units</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#fff', border: '1px solid var(--border)', borderRadius: 8 }}>
                    <Activity size={13} color="var(--success)"/>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)' }}>Live Monitoring</span>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid-4 grid">
                {[
            { label: 'Online Kiosks', value: online, color: 'green', icon: <Monitor size={20} color="var(--success)"/> },
            { label: 'Offline', value: offline, color: 'red', icon: <WifiOff size={20} color="var(--danger)"/> },
            { label: 'Maintenance', value: maintenance, color: 'orange', icon: <Monitor size={20} color="var(--warning)"/> },
            { label: 'Transactions Today', value: totalToday, color: 'blue', icon: <Activity size={20} color="var(--primary)"/> },
        ].map(s => (<div key={s.label} className={`stat-card ${s.color}`}>
                        <div className="stat-icon" style={{ background: 'var(--neutral)' }}>{s.icon}</div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>))}
            </div>

            {/* Kiosk grid */}
            <div className="grid-2 grid">
                {kiosks.map(k => {
            const sc = STATUS_COLORS[k.status];
            return (<div key={k.id} className="card" style={{ border: `1px solid ${k.status === 'offline' ? '#FFCDD2' : k.status === 'maintenance' ? '#FFE082' : 'var(--border)'}` }}>
                            <div className="card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 44, height: 44, background: sc.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Monitor size={22} color={sc.color}/>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: 15 }}>{k.id}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{k.location}</div>
                                    </div>
                                </div>
                                <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color }}>
                                    {sc.label}
                                </span>
                            </div>
                            <div className="card-body" style={{ paddingTop: 14, paddingBottom: 14 }}>
                                <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                                    {[
                    { label: 'Uptime (30d)', value: k.uptime },
                    { label: "Today's Txns", value: k.todayCount },
                    { label: 'Last Active', value: k.lastTransaction },
                ].map(({ label, value }) => (<div key={label}>
                                            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{label}</div>
                                            <div style={{ fontWeight: 700, fontSize: 14 }}>{value}</div>
                                        </div>))}
                                </div>
                                <hr className="divider" style={{ margin: '12px 0' }}/>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <div>
                                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Printer: </span>
                                        <span style={{ fontSize: 12, fontWeight: 600 }}>{PRINTER_LABELS[k.printer]}</span>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Network: </span>
                                        <span style={{ fontSize: 12, fontWeight: 600 }}>{NETWORK_LABELS[k.network]}</span>
                                    </div>
                                </div>
                                {k.status === 'offline' && (<div className="alert alert-danger" style={{ marginTop: 10 }}>
                                        <span>🔴</span><span>Kiosk is offline. Check network connectivity or dispatch technician.</span>
                                    </div>)}
                                {k.status === 'maintenance' && (<div className="alert alert-warning" style={{ marginTop: 10 }}>
                                        <span>🔧</span><span>Under scheduled maintenance. Kiosk temporarily unavailable to citizens.</span>
                                    </div>)}
                            </div>
                        </div>);
        })}
            </div>
        </div>);
}
