import { useState, useMemo, useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';
import { Search, X, CheckCircle, ChevronDown } from 'lucide-react';
function RequestDetailModal({ req, onClose }) {
    const { updateRequestStatus, adminUser } = useAdminStore();
    const [status, setStatus] = useState(req.status);
    const [assignedTo, setAssignedTo] = useState(req.assignedTo);
    const [scheduledDate, setScheduledDate] = useState(req.scheduledDate);
    const [notes, setNotes] = useState(req.adminNotes);
    const [saved, setSaved] = useState(false);
    const handleSave = () => {
        updateRequestStatus(req.id, status, assignedTo, notes, scheduledDate);
        setSaved(true);
        setTimeout(onClose, 1200);
    };
    return (<div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal">
            <div className="modal-header">
                <span className="modal-title">Service Request #{req.requestId}</span>
                <button onClick={onClose} className="btn btn-ghost btn-sm"><X size={17} /></button>
            </div>
            <div className="modal-body">
                <div style={{ background: 'var(--neutral)', borderRadius: 10, padding: 16, marginBottom: 18 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Request Details</div>
                    {[['Citizen', req.citizenName], ['Mobile', req.mobile], ['Service', req.serviceType.toUpperCase()], ['Type', req.requestType]].map(([k, v]) => (<div key={k} style={{ display: 'flex', fontSize: 12, marginBottom: 6 }}>
                        <span style={{ color: 'var(--text-secondary)', width: 90, flexShrink: 0 }}>{k}</span>
                        <span style={{ fontWeight: 600 }}>{v}</span>
                    </div>))}
                    <div style={{ marginTop: 12 }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Details</div>
                        {(() => {
                            try {
                                const parsed = JSON.parse(req.description);
                                if (typeof parsed !== 'object' || parsed === null || !Object.keys(parsed).length) throw new Error();
                                return (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '10px 16px', background: '#fff', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }}>
                                        {Object.entries(parsed).map(([key, val]) => (
                                            <div key={key}>
                                                <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                                <div style={{ fontWeight: 600, fontSize: 13, wordBreak: 'break-word' }}>{val?.toString() || '—'}</div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            } catch (e) {
                                return <div style={{ background: '#fff', padding: 12, borderRadius: 8, border: '1px solid var(--border)', fontSize: 12, wordBreak: 'break-word' }}>{req.description || 'No description.'}</div>;
                            }
                        })()}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                <div className="grid-2 grid">
                    <div className="form-group">
                        <label className="form-label">Assigned To</label>
                        <input className="form-control" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} placeholder="Technician / vehicle / team..." />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Scheduled Date</label>
                        <input className="form-control" type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Admin Notes</label>
                    <textarea className="form-control" value={notes} onChange={e => setNotes(e.target.value)} style={{ minHeight: 70 }} placeholder="Internal notes..." />
                </div>

                <div>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Timeline</div>
                    <div className="timeline">
                        {[...req.statusHistory].reverse().map((h, i) => (<div key={i} className="timeline-item">
                            <div className={`timeline-dot ${h.status === 'completed' ? 'green' : h.status === 'cancelled' ? 'red' : ''}`} />
                            <div className="timeline-content">
                                <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{h.status} <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>by {h.by}</span></div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{h.note}</div>
                                <div className="timeline-time">{new Date(h.timestamp).toLocaleString('en-IN')}</div>
                            </div>
                        </div>))}
                    </div>
                </div>
            </div>
            <div className="modal-footer">
                <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saved}>
                    {saved ? <><CheckCircle size={14} /> Saved!</> : 'Save Changes'}
                </button>
            </div>
        </div>
    </div>);
}
export function ServiceRequests() {
    const { requests, activeDept, markAsChecked } = useAdminStore();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const filtered = useMemo(() => {
        let list = activeDept === 'all' ? requests : requests.filter(r => r.serviceType === activeDept);
        if (search)
            list = list.filter(r => r.requestId.includes(search) || r.citizenName.toLowerCase().includes(search.toLowerCase()));
        if (statusFilter !== 'all')
            list = list.filter(r => r.status === statusFilter);
        return list;
    }, [requests, activeDept, search, statusFilter]);
    const DEPT_ICONS = { electricity: '⚡', water: '💧', gas: '🔥', municipal: '🏛️' };
    const STATUS_COLORS = {
        pending: 'badge-pending', confirmed: 'badge-in_progress', in_progress: 'badge-in_progress',
        completed: 'badge-resolved', cancelled: 'badge-closed'
    };
    const statusRank = {
        pending: 1,
        confirmed: 2,
        in_progress: 3,
        completed: 4,
        cancelled: 5,
    };
    const sorted = useMemo(() => {
        const list = [...filtered];
        list.sort((a, b) => {
            let compareValue = 0;
            if (sortBy === 'createdAt') {
                compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            }
            else if (sortBy === 'scheduledDate') {
                const aTime = a.scheduledDate ? new Date(a.scheduledDate).getTime() : Number.POSITIVE_INFINITY;
                const bTime = b.scheduledDate ? new Date(b.scheduledDate).getTime() : Number.POSITIVE_INFINITY;
                compareValue = aTime - bTime;
            }
            else {
                compareValue = statusRank[a.status] - statusRank[b.status];
            }
            return sortOrder === 'asc' ? compareValue : -compareValue;
        });
        return list;
    }, [filtered, sortBy, sortOrder]);
    const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
    const paginated = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return sorted.slice(start, start + rowsPerPage);
    }, [sorted, currentPage, rowsPerPage]);
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, activeDept, rowsPerPage, sortBy, sortOrder]);
    useEffect(() => {
        if (currentPage > totalPages)
            setCurrentPage(totalPages);
    }, [currentPage, totalPages]);
    const toggleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
            return;
        }
        setSortBy(field);
        setSortOrder(field === 'createdAt' ? 'desc' : 'asc');
    };
    const sortIndicator = (field) => {
        if (sortBy !== field)
            return <ChevronDown size={12} style={{ opacity: 0.35 }} />;
        return <ChevronDown size={12} style={{ transform: sortOrder === 'asc' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />;
    };
    return (<div className="space-y-4">
        <div className="page-header">
            <div>
                <h1 className="page-title">Service Requests</h1>
                <p className="page-subtitle">Manage and schedule citizen service requests</p>
            </div>
        </div>

        <div className="filters-row">
            <div className="search-box" style={{ minWidth: 220 }}>
                <Search size={14} className="search-icon" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search request ID or name..." />
            </div>
            <select className="form-control" style={{ width: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
            </select>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>{sorted.length} requests</span>
        </div>

        <div className="card">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Request ID</th>
                        <th>Dept</th>
                        <th>Citizen</th>
                        <th>Type</th>
                        <th>
                            <button className="btn btn-ghost btn-sm" style={{ padding: 0, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => toggleSort('scheduledDate')}>
                                Scheduled {sortIndicator('scheduledDate')}
                            </button>
                        </th>
                        <th>Assigned To</th>
                        <th>
                            <button className="btn btn-ghost btn-sm" style={{ padding: 0, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => toggleSort('status')}>
                                Status {sortIndicator('status')}
                            </button>
                        </th>
                        <th>
                            <button className="btn btn-ghost btn-sm" style={{ padding: 0, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => toggleSort('createdAt')}>
                                Created {sortIndicator('createdAt')}
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {paginated.map(r => (<tr key={r.id} onClick={() => {
                        setSelected(r); if (!r.checked)
                            markAsChecked('request', r.id);
                    }} style={{ cursor: 'pointer' }}>
                        <td style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 600, fontSize: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {!r.checked && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3B82F6', flexShrink: 0, boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' }} title="Unread" />}
                                {r.requestId}
                            </div>
                        </td>
                        <td><span style={{ fontSize: 16 }}>{DEPT_ICONS[r.serviceType]}</span></td>
                        <td>
                            <div style={{ fontWeight: 600, fontSize: 12 }}>{r.citizenName}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{r.mobile}</div>
                        </td>
                        <td style={{ fontSize: 12 }}>{r.requestType}</td>
                        <td style={{ fontSize: 12 }}>{r.scheduledDate || '–'}</td>
                        <td style={{ fontSize: 12 }}>{r.assignedTo || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                        <td><span className={`badge ${STATUS_COLORS[r.status]}`}>{r.status.replace('_', ' ')}</span></td>
                        <td style={{ fontSize: 12 }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>))}
                    {sorted.length === 0 && (<tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No service requests found</td></tr>)}
                </tbody>
            </table>

            {sorted.length > 0 && (<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span>Rows:</span>
                    <select className="form-control" style={{ width: 84 }} value={rowsPerPage} onChange={e => setRowsPerPage(Number(e.target.value))}>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span>
                        {(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, sorted.length)} of {sorted.length}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
                    <span style={{ fontSize: 12, alignSelf: 'center', color: 'var(--text-secondary)' }}>Page {currentPage} / {totalPages}</span>
                    <button className="btn btn-outline btn-sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
                </div>
            </div>)}
        </div>

        {selected && <RequestDetailModal req={selected} onClose={() => setSelected(null)} />}
    </div>);
}
