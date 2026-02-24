import { useState, useMemo, useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { AlertTriangle, Activity, Clock3, FileText, IndianRupee, Users, Wifi, Zap, TrendingDown, TrendingUp, Eye, UserCheck, Wrench } from 'lucide-react';

const CHART_COLORS = ['#0066CC', '#28A745', '#FF9800', '#DC3545'];
const DEPARTMENT_LABELS = {
    electricity: 'Electricity',
    water: 'Water',
    gas: 'Gas',
    municipal: 'Municipal',
};

const toHours = (start, end) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    if (Number.isNaN(s) || Number.isNaN(e) || e < s)
        return 0;
    return (e - s) / (1000 * 60 * 60);
};

const timeAgo = (input) => {
    const target = new Date(input).getTime();
    if (Number.isNaN(target))
        return 'just now';
    const diff = Math.max(0, Date.now() - target);
    const mins = Math.floor(diff / 60000);
    if (mins < 1)
        return 'just now';
    if (mins < 60)
        return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)
        return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

const formatMoney = (amount) => `₹${amount.toLocaleString('en-IN')}`;

function ChartSkeleton() {
    return (
        <div style={{ padding: 12 }}>
            <div style={{ height: 14, width: '40%', background: '#E2E8F0', borderRadius: 8, marginBottom: 14 }} />
            <div style={{ height: 180, background: '#F1F5F9', borderRadius: 10, border: '1px solid #E2E8F0' }} />
        </div>
    );
}

export function OverviewDashboard() {
    const { complaints, bills, connections, requests, kiosks, activeDept } = useAdminStore();
    const [hoveredKpi, setHoveredKpi] = useState(null);
    const [chartsLoading, setChartsLoading] = useState(true);

    const filtered = (items) => activeDept === 'all' ? items : items.filter((i) => i.serviceType === activeDept);

    const fComplaints = useMemo(() => filtered(complaints), [complaints, activeDept]);
    const fBills = useMemo(() => filtered(bills), [bills, activeDept]);
    const fConnections = useMemo(() => filtered(connections), [connections, activeDept]);
    const fRequests = useMemo(() => filtered(requests), [requests, activeDept]);

    useEffect(() => {
        setChartsLoading(true);
        const timer = setTimeout(() => setChartsLoading(false), 700);
        return () => clearTimeout(timer);
    }, [activeDept]);

    const openComplaints = fComplaints.filter(c => c.status === 'open' || c.status === 'in_progress').length;
    const pendingConnections = fConnections.filter(c => c.status === 'pending' || c.status === 'document_verification' || c.status === 'field_inspection').length;
    const revenueToday = fBills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0);

    const activeCitizensToday = useMemo(() => {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        const ids = new Set();
        fComplaints.forEach(c => {
            if (new Date(c.createdAt).getTime() >= start) ids.add(c.citizenName);
        });
        fRequests.forEach(r => {
            if (new Date(r.createdAt).getTime() >= start) ids.add(r.citizenName);
        });
        return ids.size;
    }, [fComplaints, fRequests]);

    const averageResolutionHours = useMemo(() => {
        const resolvedItems = fComplaints.filter(c => c.status === 'resolved' || c.status === 'closed');
        if (resolvedItems.length === 0) return 0;
        const total = resolvedItems.reduce((sum, item) => sum + toHours(item.createdAt, item.updatedAt), 0);
        return total / resolvedItems.length;
    }, [fComplaints]);

    const onlineKiosks = kiosks.filter(k => k.status === 'online').length;

    const kpiCards = [
        {
            key: 'open',
            label: 'Open Complaints',
            value: openComplaints,
            trend: '↑ 8% vs yesterday',
            up: true,
            icon: <FileText size={16} color="#334155" />,
            tooltip: 'All open and in-progress complaints requiring action.',
        },
        {
            key: 'connections',
            label: 'Pending Connections',
            value: pendingConnections,
            trend: '↓ 4% vs yesterday',
            up: false,
            icon: <Zap size={16} color="#334155" />,
            tooltip: 'Pending/document verification/field inspection applications.',
        },
        {
            key: 'revenue',
            label: 'Revenue Collected Today',
            value: formatMoney(revenueToday),
            trend: '↑ 11% vs yesterday',
            up: true,
            icon: <IndianRupee size={16} color="#334155" />,
            tooltip: 'Total amount from paid bills in current operational view.',
        },
        {
            key: 'citizens',
            label: 'Active Citizens Today',
            value: activeCitizensToday,
            trend: '↑ 6% vs yesterday',
            up: true,
            icon: <Users size={16} color="#334155" />,
            tooltip: 'Unique citizens with requests/complaints registered today.',
        },
        {
            key: 'resolution',
            label: 'Average Resolution Time',
            value: averageResolutionHours > 0 ? `${averageResolutionHours.toFixed(1)}h` : '—',
            trend: '↓ 0.4h vs last week',
            up: true,
            icon: <Clock3 size={16} color="#334155" />,
            tooltip: 'Average duration from complaint creation to latest resolution update.',
        },
        {
            key: 'kiosks',
            label: 'Kiosks Online / Total',
            value: `${onlineKiosks} / ${kiosks.length}`,
            trend: onlineKiosks === kiosks.length ? '↑ Stable' : '↓ Needs attention',
            up: onlineKiosks === kiosks.length,
            icon: <Wifi size={16} color="#334155" />,
            tooltip: 'Operational kiosk uptime snapshot.',
        },
    ];

    const criticalAlerts = fComplaints
        .filter(c => c.priority === 'urgent' && (c.complaintType.toLowerCase().includes('gas') || c.complaintType.toLowerCase().includes('outage')))
        .slice(0, 2);
    const slaBreaches = fComplaints
        .filter(c => new Date(c.slaDeadline).getTime() < Date.now() && c.status !== 'resolved' && c.status !== 'closed')
        .slice(0, 2);
    const maintenanceWarnings = kiosks
        .filter(k => k.status === 'maintenance' || k.printer === 'low_paper' || k.network === 'poor')
        .slice(0, 2);

    const complaintVolumeTrend = useMemo(() => {
        const now = new Date();
        return Array.from({ length: 7 }).map((_, idx) => {
            const target = new Date(now);
            target.setDate(now.getDate() - (6 - idx));
            const dateKey = target.toDateString();
            const label = target.toLocaleDateString('en-IN', { weekday: 'short' });
            const created = fComplaints.filter(c => new Date(c.createdAt).toDateString() === dateKey).length;
            return { day: label, complaints: created };
        });
    }, [fComplaints]);

    const resolutionStatusData = useMemo(() => {
        const rows = [
            { name: 'Open', value: fComplaints.filter(c => c.status === 'open').length },
            { name: 'In Progress', value: fComplaints.filter(c => c.status === 'in_progress').length },
            { name: 'Resolved', value: fComplaints.filter(c => c.status === 'resolved').length },
            { name: 'Closed', value: fComplaints.filter(c => c.status === 'closed').length },
        ];
        return rows.filter(r => r.value > 0);
    }, [fComplaints]);

    const revenueVsTargetData = useMemo(() => {
        const departments = ['electricity', 'water', 'gas', 'municipal'];
        return departments
            .filter(dept => activeDept === 'all' || dept === activeDept)
            .map(dept => {
                const collected = bills
                    .filter(b => b.serviceType === dept && b.status === 'paid')
                    .reduce((sum, b) => sum + b.amount, 0);
                const target = Math.max(1000, Math.round(collected * 1.25));
                return { dept: DEPARTMENT_LABELS[dept], collected, target };
            });
    }, [bills, activeDept]);

    const departmentComparisonData = useMemo(() => {
        const departments = ['electricity', 'water', 'gas', 'municipal'];
        return departments
            .filter(dept => activeDept === 'all' || dept === activeDept)
            .map(dept => ({
                dept: DEPARTMENT_LABELS[dept],
                complaints: complaints.filter(c => c.serviceType === dept).length,
            }));
    }, [complaints, activeDept]);

    const activityFeed = useMemo(() => {
        const complaintEvents = fComplaints.map(c => ({
            key: `c-${c.id}`,
            tone: '#DC3545',
            text: `${c.citizenName} registered ${c.complaintType} ${c.location ? `at ${c.location}` : `in ${c.serviceType.toUpperCase()}`}`,
            at: c.updatedAt || c.createdAt,
        }));
        const billEvents = fBills.map(b => ({
            key: `b-${b.id}`,
            tone: '#16A34A',
            text: `${b.citizenName} paid bill ${b.billNumber} at ${b.serviceType.toUpperCase()} counter`,
            at: b.alertSentAt || b.dueDate,
        }));
        const requestEvents = fRequests.map(r => ({
            key: `r-${r.id}`,
            tone: '#2563EB',
            text: `${r.citizenName} request ${r.requestType} updated at ${r.serviceType.toUpperCase()} desk`,
            at: r.createdAt,
        }));
        return [...complaintEvents, ...billEvents, ...requestEvents]
            .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
            .slice(0, 20);
    }, [fComplaints, fBills, fRequests]);

    const hasAnyChartData = complaintVolumeTrend.some(d => d.complaints > 0)
        || resolutionStatusData.length > 0
        || revenueVsTargetData.some(d => d.collected > 0 || d.target > 0)
        || departmentComparisonData.some(d => d.complaints > 0);

    return (
        <div className="space-y-4">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Operations Command Center</h1>
                    <p className="page-subtitle">Live operational visibility across municipal service lines</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: '#fff' }}>
                    <Activity size={14} color="var(--success)" />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)' }}>Live Command View</span>
                </div>
            </div>

            {/* 1) KPI Snapshot Row */}
            <div className="grid-6 grid">
                {kpiCards.map(card => (
                    <button
                        key={card.key}
                        title={card.tooltip}
                        onMouseEnter={() => setHoveredKpi(card.key)}
                        onMouseLeave={() => setHoveredKpi(null)}
                        style={{
                            textAlign: 'left',
                            border: '1px solid var(--border)',
                            background: '#fff',
                            borderRadius: 12,
                            padding: 12,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: hoveredKpi === card.key ? '0 8px 20px rgba(15, 23, 42, 0.08)' : 'none',
                            transform: hoveredKpi === card.key ? 'translateY(-1px)' : 'none',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {card.icon}
                            </div>
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{card.value}</div>
                        <div style={{ marginTop: 5, fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{card.label}</div>
                        <div style={{ marginTop: 6, fontSize: 11, color: card.up ? '#16A34A' : '#EA580C', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {card.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {card.trend}
                        </div>
                    </button>
                ))}
            </div>

            {/* 2) Priority Alerts Strip */}
            <div className="grid-3 grid">
                <div style={{ border: '1px solid #FECACA', background: '#FEF2F2', borderRadius: 12, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#B91C1C' }}>Critical · Gas leaks / outages</div>
                        <AlertTriangle size={14} color="#B91C1C" />
                    </div>
                    {criticalAlerts.length > 0 ? criticalAlerts.map(alert => (
                        <div key={alert.id} style={{ marginBottom: 8, background: '#fff', borderRadius: 8, padding: 8, border: '1px solid #FECACA' }}>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{alert.complaintType}</div>
                            <div style={{ fontSize: 11, color: '#7F1D1D', marginTop: 2 }}>{alert.location} · {timeAgo(alert.createdAt)}</div>
                            <button className="btn btn-outline btn-sm" style={{ marginTop: 6 }}>
                                <Eye size={12} /> View
                            </button>
                        </div>
                    )) : (<div style={{ fontSize: 12, color: '#7F1D1D' }}>No critical incidents right now.</div>)}
                </div>

                <div style={{ border: '1px solid #FED7AA', background: '#FFF7ED', borderRadius: 12, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#C2410C' }}>Urgent · SLA breaches</div>
                        <Clock3 size={14} color="#C2410C" />
                    </div>
                    {slaBreaches.length > 0 ? slaBreaches.map(alert => (
                        <div key={alert.id} style={{ marginBottom: 8, background: '#fff', borderRadius: 8, padding: 8, border: '1px solid #FED7AA' }}>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{alert.complaintId}</div>
                            <div style={{ fontSize: 11, color: '#9A3412', marginTop: 2 }}>{alert.citizenName} · breached {timeAgo(alert.slaDeadline)}</div>
                            <button className="btn btn-outline btn-sm" style={{ marginTop: 6 }}>
                                <UserCheck size={12} /> Assign
                            </button>
                        </div>
                    )) : (<div style={{ fontSize: 12, color: '#9A3412' }}>No SLA breach right now.</div>)}
                </div>

                <div style={{ border: '1px solid #FDE68A', background: '#FEFCE8', borderRadius: 12, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#A16207' }}>Warning · Maintenance due</div>
                        <Wrench size={14} color="#A16207" />
                    </div>
                    {maintenanceWarnings.length > 0 ? maintenanceWarnings.map(kiosk => (
                        <div key={kiosk.id} style={{ marginBottom: 8, background: '#fff', borderRadius: 8, padding: 8, border: '1px solid #FDE68A' }}>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{kiosk.id}</div>
                            <div style={{ fontSize: 11, color: '#854D0E', marginTop: 2 }}>{kiosk.location} · {kiosk.status}</div>
                            <button className="btn btn-outline btn-sm" style={{ marginTop: 6 }}>
                                <Eye size={12} /> View
                            </button>
                        </div>
                    )) : (<div style={{ fontSize: 12, color: '#854D0E' }}>No maintenance warnings right now.</div>)}
                </div>
            </div>

            {/* 3) Analytics Grid (2x2) */}
            <div className="grid-2 grid">
                <div className="card">
                    <div className="card-header"><span className="card-title">Complaint volume trend</span></div>
                    <div className="card-body">
                        {chartsLoading ? (<ChartSkeleton />) : complaintVolumeTrend.some(d => d.complaints > 0) ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={complaintVolumeTrend} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12 }} />
                                    <Line type="monotone" dataKey="complaints" stroke="#0066CC" strokeWidth={2.2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (<div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                            No complaint trend data available.
                        </div>)}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header"><span className="card-title">Resolution status</span></div>
                    <div className="card-body">
                        {chartsLoading ? (<ChartSkeleton />) : resolutionStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={resolutionStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={2}>
                                        {resolutionStatusData.map((entry, index) => (<Cell key={`${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (<div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                            No resolution data available.
                        </div>)}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header"><span className="card-title">Revenue collection vs target</span></div>
                    <div className="card-body">
                        {chartsLoading ? (<ChartSkeleton />) : revenueVsTargetData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={revenueVsTargetData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                    <XAxis dataKey="dept" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip formatter={(v) => formatMoney(v)} contentStyle={{ borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12 }} />
                                    <Bar dataKey="collected" fill="#28A745" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="target" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (<div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                            No revenue data available.
                        </div>)}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header"><span className="card-title">Department-wise comparison</span></div>
                    <div className="card-body">
                        {chartsLoading ? (<ChartSkeleton />) : departmentComparisonData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart layout="vertical" data={departmentComparisonData} margin={{ top: 8, right: 8, left: 24, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                    <XAxis type="number" tick={{ fontSize: 11 }} />
                                    <YAxis dataKey="dept" type="category" tick={{ fontSize: 11 }} width={88} />
                                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 12 }} />
                                    <Bar dataKey="complaints" fill="#0066CC" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (<div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                            No department comparison data.
                        </div>)}
                    </div>
                </div>
            </div>

            {/* 4) Live Activity Feed */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title">Live Activity Feed</span>
                    <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>● Real-time updates</span>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                    {activityFeed.length > 0 ? (
                        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                            {activityFeed.map(item => (
                                <div key={item.key} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '11px 16px', borderBottom: '1px solid #F1F5F9' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.tone, marginTop: 6 }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.4 }}>{item.text}</div>
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{timeAgo(item.at)}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                            No live activity available.
                        </div>
                    )}
                </div>
            </div>

            {hasAnyChartData === false && !chartsLoading && (
                <div className="card" style={{ padding: 16, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                    Dashboard analytics is currently empty for this department selection.
                </div>
            )}
        </div>
    );
}
