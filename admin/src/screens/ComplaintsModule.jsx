import { useState, useMemo, useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';
import { Search, Download, ChevronDown, X, Clock, MessageSquare, User, FileText, Send, CheckCircle } from 'lucide-react';
import { canAssignComplaints } from '../utils/permissions';
function ComplaintDetailModal({ complaint, onClose }) {
    const { adminUser, updateComplaintStatus } = useAdminStore();
    const [status, setStatus] = useState(complaint.status);
    const [adminNotes, setAdminNotes] = useState(complaint.adminNotes);
    const [citizenMsg, setCitizenMsg] = useState(complaint.citizenUpdateMessage);
    const [saved, setSaved] = useState(false);
    const [assignedTo, setAssignedTo] = useState(complaint.assignedTo || '');
    const canEditComplaint = canAssignComplaints(adminUser?.role);
    const handleSave = () => {
        updateComplaintStatus(complaint.id, status, adminNotes, citizenMsg, adminUser?.name || 'Admin', assignedTo);
        setSaved(true);
        setTimeout(() => { setSaved(false); onClose(); }, 1200);
    };
    const statusColors = {
        open: '#E65100', in_progress: '#1565C0', resolved: '#2E7D32', closed: '#546E7A'
    };
    const slaRemaining = () => {
        const deadline = new Date(complaint.slaDeadline).getTime();
        const now = Date.now();
        const diff = deadline - now;
        if (diff < 0)
            return { label: 'SLA Breached', color: 'var(--danger)' };
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const pct = Math.max(0, Math.min(100, (diff / (4 * 3600000)) * 100));
        return { label: `${hrs}h ${mins}m remaining`, color: pct > 50 ? 'var(--success)' : pct > 25 ? 'var(--warning)' : 'var(--danger)', pct };
    };
    const sla = slaRemaining();
    return (<div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal modal-lg">
            {/* Header */}
            <div className="modal-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="modal-title">Complaint #{complaint.complaintId}</span>
                        <span className="badge badge-in_progress" style={{ background: `${statusColors[complaint.status]}22`, color: statusColors[complaint.status] }}>
                            {complaint.status.replace('_', ' ')}
                        </span>
                        <span className={`badge priority-${complaint.priority}`}>{complaint.priority.toUpperCase()}</span>
                    </div>
                </div>
                <button onClick={onClose} className="btn btn-ghost btn-sm"><X size={18} /></button>
            </div>

            <div className="modal-body">
                <div className="grid-2 grid" style={{ marginBottom: 24 }}>
                    {/* Citizen info */}
                    <div style={{ background: 'var(--neutral)', borderRadius: 10, padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <User size={15} color="var(--primary)" />
                            <span style={{ fontWeight: 700, fontSize: 13 }}>Citizen Information</span>
                        </div>
                        <div className="space-y-3">
                            {[
                                ['Name', complaint.citizenName],
                                ['Mobile', complaint.citizenMobile],
                                ['Consumer ID', complaint.consumerId],
                                ['Department', complaint.serviceType.toUpperCase()],
                            ].map(([k, v]) => (<div key={k} style={{ display: 'flex', fontSize: 12 }}>
                                <span style={{ color: 'var(--text-secondary)', width: 100, flexShrink: 0 }}>{k}</span>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v}</span>
                            </div>))}
                        </div>
                    </div>

                    {/* Complaint details */}
                    <div style={{ background: 'var(--neutral)', borderRadius: 10, padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <FileText size={15} color="var(--primary)" />
                            <span style={{ fontWeight: 700, fontSize: 13 }}>Complaint Details</span>
                        </div>
                        <div style={{ fontSize: 12, marginBottom: 10 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Type: </span>
                            <span style={{ fontWeight: 600 }}>{complaint.complaintType}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.6, background: '#fff', padding: 10, borderRadius: 8, border: '1px solid var(--border)' }}>
                            {complaint.description}
                        </div>
                        {/* SLA */}
                        <div style={{ marginTop: 12, background: '#fff', borderRadius: 8, padding: 10, border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Clock size={11} /> SLA Status
                                </span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: sla.color }}>{sla.label}</span>
                            </div>
                            {sla.pct !== undefined && (<div style={{ height: 4, background: '#E2E8F0', borderRadius: 2 }}>
                                <div style={{ height: '100%', width: `${sla.pct}%`, background: sla.color, borderRadius: 2, transition: 'width 0.3s' }} />
                            </div>)}
                        </div>
                    </div>
                </div>

                {/* Attachments */}
                {complaint.attachments?.length > 0 && (<div style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>📎 Attachments</div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {complaint.attachments.map((att, i) => (<div key={i} style={{ padding: '8px 14px', background: 'var(--primary-light)', borderRadius: 8, border: '1px solid #bfdbfe', fontSize: 12, fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}>
                            📄 {att.name}
                        </div>))}
                    </div>
                </div>)}

                <hr className="divider" />

                {/* Admin actions */}
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        ⚡ Admin Actions
                    </div>
                    <div className="grid-2 grid" style={{ marginBottom: 14 }}>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Update Status</label>
                            <select className="form-control" value={status} onChange={e => setStatus(e.target.value)} disabled={!canEditComplaint}>
                                <option value="open">🔴 Open</option>
                                <option value="in_progress">🔵 In Progress</option>
                                <option value="resolved">🟢 Resolved</option>
                                <option value="closed">⚫ Closed</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                            <label className="form-label">Assigned To</label>
                            <input className="form-control" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} placeholder="Assign technician name" disabled={!canEditComplaint} />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 14 }}>
                        <label className="form-label">🔒 Internal Admin Notes (not visible to citizen)</label>
                        <textarea className="form-control" value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Internal notes for admin/team..." style={{ minHeight: 80 }} disabled={!canEditComplaint} />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">📣 Citizen Update Message (visible on kiosk)</label>
                        <textarea className="form-control" value={citizenMsg} onChange={e => setCitizenMsg(e.target.value)} placeholder="Message that will be visible to citizen when they track their complaint..." style={{ minHeight: 80 }} disabled={!canEditComplaint} />
                    </div>
                </div>

                {/* Timeline */}
                <div style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14 }}>📋 Status History</div>
                    <div className="timeline">
                        {(complaint.statusHistory || []).map((h, i) => (<div key={i} className="timeline-item">
                            <div className={`timeline-dot ${h.status?.toLowerCase() === 'resolved' ? 'green' : h.status?.toLowerCase() === 'in_progress' ? '' : h.status?.toLowerCase() === 'open' ? 'orange' : 'gray'}`} />
                            <div className="timeline-content">
                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                                    {h.status.replace('_', ' ')}
                                    <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-secondary)', marginLeft: 6 }}>by {h.by}</span>
                                </div>
                                {h.note && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>🔒 {h.note}</div>}
                                {h.citizenMessage && <div style={{ fontSize: 11, color: 'var(--primary)', marginTop: 2, fontWeight: 500 }}>📣 {h.citizenMessage}</div>}
                                <div className="timeline-time">{new Date(h.timestamp).toLocaleString('en-IN')}</div>
                            </div>
                        </div>))}
                    </div>
                </div>
            </div>

            <div className="modal-footer">
                <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saved || !canEditComplaint}>
                    {saved ? <><CheckCircle size={14} /> Saved!</> : <><Send size={14} /> Save & Send Update</>}
                </button>
            </div>
        </div>
    </div>);
}
// ─── Main Complaints Module ─────────────────────────────────
export function ComplaintsModule() {
    const { complaints, activeDept, markAsChecked, adminUser, bulkUpdateComplaintStatus, bulkAssignComplaints } = useAdminStore();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkStatus, setBulkStatus] = useState('in_progress');
    const [bulkAssignee, setBulkAssignee] = useState('');
    const [selected, setSelected] = useState(null);
    const [showExportSummary, setShowExportSummary] = useState(false);
    const [exportMode, setExportMode] = useState('entire');
    const [exportStatusValue, setExportStatusValue] = useState('all');
    const [exportPriorityValue, setExportPriorityValue] = useState('all');
    const [exportDateValue, setExportDateValue] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const canEditComplaint = canAssignComplaints(adminUser?.role);
    const isInDateRange = (createdAt) => {
        if (dateFilter === 'all')
            return true;
        const created = new Date(createdAt).getTime();
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const dayMs = 24 * 60 * 60 * 1000;
        if (dateFilter === 'today')
            return created >= startOfToday;
        if (dateFilter === '7d')
            return created >= now.getTime() - (7 * dayMs);
        return created >= now.getTime() - (30 * dayMs);
    };
    const assigneeOptions = useMemo(() => [...new Set(complaints.map(c => c.assignedTo).filter(Boolean))], [complaints]);
    const filtered = useMemo(() => {
        let list = activeDept === 'all' ? complaints : complaints.filter(c => c.serviceType === activeDept);
        if (search)
            list = list.filter(c => c.complaintId.includes(search) ||
                c.citizenName.toLowerCase().includes(search.toLowerCase()) ||
                c.description.toLowerCase().includes(search.toLowerCase()) ||
                c.consumerId.toLowerCase().includes(search.toLowerCase()));
        if (statusFilter !== 'all')
            list = list.filter(c => c.status === statusFilter);
        if (priorityFilter !== 'all')
            list = list.filter(c => c.priority === priorityFilter);
        list = list.filter(c => isInDateRange(c.createdAt));
        return list;
    }, [complaints, activeDept, search, statusFilter, priorityFilter, dateFilter]);
    const allFilteredSelected = filtered.length > 0 && filtered.every(c => selectedIds.includes(c.id));
    const priorityRank = { urgent: 4, high: 3, medium: 2, low: 1 };
    const statusRank = { open: 1, in_progress: 2, resolved: 3, closed: 4 };
    const sorted = useMemo(() => {
        const list = [...filtered];
        list.sort((a, b) => {
            let compareValue = 0;
            if (sortBy === 'createdAt') {
                compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            }
            else if (sortBy === 'slaDeadline') {
                compareValue = new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime();
            }
            else if (sortBy === 'priority') {
                compareValue = priorityRank[a.priority] - priorityRank[b.priority];
            }
            else if (sortBy === 'status') {
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
    }, [search, statusFilter, priorityFilter, dateFilter, activeDept, rowsPerPage, sortBy, sortOrder]);
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
    const toggleSelectAllFiltered = () => {
        if (allFilteredSelected) {
            setSelectedIds(prev => prev.filter(id => !filtered.some(c => c.id === id)));
            return;
        }
        setSelectedIds(prev => [...new Set([...prev, ...filtered.map(c => c.id)])]);
    };
    const toggleRowSelection = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };
    const applyBulkStatus = () => {
        if (!canEditComplaint || selectedIds.length === 0)
            return;
        bulkUpdateComplaintStatus(selectedIds, bulkStatus, adminUser?.name || 'Admin');
        setSelectedIds([]);
    };
    const applyBulkAssign = () => {
        if (!canEditComplaint || selectedIds.length === 0 || !bulkAssignee)
            return;
        bulkAssignComplaints(selectedIds, bulkAssignee, adminUser?.name || 'Admin');
        setSelectedIds([]);
    };
    const stats = {
        total: complaints.length,
        open: complaints.filter(c => c.status === 'open').length,
        inProgress: complaints.filter(c => c.status === 'in_progress').length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
    };
    const DEPT_ICONS = { electricity: '⚡', water: '💧', gas: '🔥', municipal: '🏛️' };
    const isSLANear = (c) => {
        const diff = new Date(c.slaDeadline).getTime() - Date.now();
        return diff > 0 && diff < 4 * 3600000;
    };
    const isSLABreached = (c) => new Date(c.slaDeadline).getTime() < Date.now();
    const exportBaseList = useMemo(() => {
        return activeDept === 'all' ? complaints : complaints.filter(c => c.serviceType === activeDept);
    }, [complaints, activeDept]);
    const exportDateInRange = (createdAt, range) => {
        if (range === 'all')
            return true;
        const created = new Date(createdAt).getTime();
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const dayMs = 24 * 60 * 60 * 1000;
        if (range === 'today')
            return created >= startOfToday;
        if (range === '7d')
            return created >= now.getTime() - (7 * dayMs);
        return created >= now.getTime() - (30 * dayMs);
    };
    const exportRowsSource = useMemo(() => {
        if (exportMode === 'status') {
            return exportStatusValue === 'all'
                ? exportBaseList
                : exportBaseList.filter(c => c.status === exportStatusValue);
        }
        if (exportMode === 'priority') {
            return exportPriorityValue === 'all'
                ? exportBaseList
                : exportBaseList.filter(c => c.priority === exportPriorityValue);
        }
        if (exportMode === 'date') {
            return exportBaseList.filter(c => exportDateInRange(c.createdAt, exportDateValue));
        }
        return exportBaseList;
    }, [exportMode, exportStatusValue, exportPriorityValue, exportDateValue, exportBaseList]);
    const runComplaintsCsvExport = () => {
        if (exportRowsSource.length === 0) {
            window.alert('No complaints available for export with selected criteria.');
            return;
        }
        const escapeCsv = (value) => {
            const text = String(value ?? '');
            if (text.includes(',') || text.includes('"') || text.includes('\n')) {
                return `"${text.replace(/"/g, '""')}"`;
            }
            return text;
        };
        const headers = [
            'Complaint ID',
            'Department',
            'Type',
            'Description',
            'Citizen',
            'Citizen Mobile',
            'Consumer ID',
            'Location',
            'Priority',
            'Status',
            'Assigned To',
            'SLA Deadline',
            'Created At',
            'Admin Notes',
            'Citizen Update Message',
        ];
        const rows = exportRowsSource.map(c => [
            c.complaintId,
            c.serviceType,
            c.complaintType,
            c.description,
            c.citizenName,
            c.citizenMobile,
            c.consumerId,
            c.location,
            c.priority,
            c.status,
            c.assignedTo,
            new Date(c.slaDeadline).toISOString(),
            new Date(c.createdAt).toISOString(),
            c.adminNotes,
            c.citizenUpdateMessage,
        ]);
        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => escapeCsv(cell)).join(','))
            .join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const dept = activeDept === 'all' ? 'all-departments' : activeDept;
        const date = new Date().toISOString().slice(0, 10);
        const modeLabel = exportMode === 'status'
            ? `status-${exportStatusValue}`
            : exportMode === 'priority'
                ? `priority-${exportPriorityValue}`
                : exportMode === 'date'
                    ? `date-${exportDateValue}`
                    : 'entire';
        link.href = url;
        link.download = `complaints-${dept}-${modeLabel}-${date}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    const exportFileName = `complaints-${activeDept === 'all' ? 'all-departments' : activeDept}-${exportMode === 'status'
        ? `status-${exportStatusValue}`
        : exportMode === 'priority'
            ? `priority-${exportPriorityValue}`
            : exportMode === 'date'
                ? `date-${exportDateValue}`
                : 'entire'}-${new Date().toISOString().slice(0, 10)}.csv`;
    return (<div className="space-y-4">
        {/* Page header */}
        <div className="page-header">
            <div>
                <h1 className="page-title">Complaint Management</h1>
                <p className="page-subtitle">
                    {stats.total} total · {stats.open} open · {stats.inProgress} in progress · {stats.resolved} resolved
                </p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setShowExportSummary(true)}><Download size={14} /> Export</button>
        </div>

        {/* Quick stat pills */}
        <div style={{ display: 'flex', gap: 10 }}>
            {[
                { label: 'Total', val: stats.total, color: 'var(--primary)' },
                { label: 'Open', val: stats.open, color: 'var(--warning)' },
                { label: 'In Progress', val: stats.inProgress, color: 'var(--primary)' },
                { label: 'Resolved', val: stats.resolved, color: 'var(--success)' },
            ].map(s => (<div key={s.label} style={{ padding: '6px 14px', background: '#fff', border: '1px solid var(--border)', borderRadius: 20, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: s.color }}>{s.val}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
            </div>))}
        </div>

        {/* Filters */}
        <div className="filters-row">
            <div className="search-box" style={{ minWidth: 220 }}>
                <Search size={14} className="search-icon" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID, name, consumer ID..." />
            </div>
            <select className="form-control" style={{ width: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
            </select>
            <select className="form-control" style={{ width: 130 }} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
            </select>
            <select className="form-control" style={{ width: 140 }} value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
            </select>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} results</span>
        </div>

        {selectedIds.length > 0 && (<div className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{selectedIds.length} selected</span>
            <select className="form-control" style={{ width: 140 }} value={bulkStatus} onChange={e => setBulkStatus(e.target.value)} disabled={!canEditComplaint}>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
            </select>
            <button className="btn btn-outline btn-sm" onClick={applyBulkStatus} disabled={!canEditComplaint}>Apply Status</button>
            <select className="form-control" style={{ width: 190 }} value={bulkAssignee} onChange={e => setBulkAssignee(e.target.value)} disabled={!canEditComplaint}>
                <option value="">Assign technician...</option>
                {assigneeOptions.map(name => (<option key={name} value={name}>{name}</option>))}
            </select>
            <button className="btn btn-outline btn-sm" onClick={applyBulkAssign} disabled={!canEditComplaint || !bulkAssignee}>Assign</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedIds([])}>Clear</button>
        </div>)}

        {/* Table */}
        <div className="card">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>
                            <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAllFiltered} aria-label="Select all filtered complaints" />
                        </th>
                        <th>Complaint ID</th>
                        <th>Dept</th>
                        <th>Type</th>
                        <th>Citizen</th>
                        <th>
                            <button className="btn btn-ghost btn-sm" style={{ padding: 0, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => toggleSort('priority')}>
                                Priority {sortIndicator('priority')}
                            </button>
                        </th>
                        <th>
                            <button className="btn btn-ghost btn-sm" style={{ padding: 0, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => toggleSort('status')}>
                                Status {sortIndicator('status')}
                            </button>
                        </th>
                        <th>
                            <button className="btn btn-ghost btn-sm" style={{ padding: 0, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => toggleSort('slaDeadline')}>
                                SLA {sortIndicator('slaDeadline')}
                            </button>
                        </th>
                        <th>
                            <button className="btn btn-ghost btn-sm" style={{ padding: 0, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => toggleSort('createdAt')}>
                                Date {sortIndicator('createdAt')}
                            </button>
                        </th>
                        <th>Comments</th>
                    </tr>
                </thead>
                <tbody>
                    {paginated.map(c => (<tr key={c.id} onClick={() => {
                        setSelected(c); if (!c.checked)
                            markAsChecked('complaint', c.id);
                    }} style={{ cursor: 'pointer' }}>
                        <td onClick={(e) => e.stopPropagation()}>
                            <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleRowSelection(c.id)} aria-label={`Select complaint ${c.complaintId}`} />
                        </td>
                        <td style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {!c.checked && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3B82F6', flexShrink: 0, boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' }} title="Unread" />}
                                {c.complaintId}
                            </div>
                        </td>
                        <td>
                            <span title={c.serviceType} style={{ fontSize: 16 }}>{DEPT_ICONS[c.serviceType]}</span>
                        </td>
                        <td style={{ maxWidth: 160 }}>
                            <div className="truncate" style={{ fontSize: 12 }}>{c.complaintType}</div>
                        </td>
                        <td>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{c.citizenName}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{c.consumerId}</div>
                        </td>
                        <td><span className={`badge priority-${c.priority}`}>{c.priority}</span></td>
                        <td><span className={`badge badge-${c.status}`}>{c.status.replace('_', ' ')}</span></td>
                        <td>
                            {isSLABreached(c) ? (<span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 700 }}>🔴 Breached</span>) : isSLANear(c) ? (<span style={{ fontSize: 11, color: 'var(--warning)', fontWeight: 700 }}>⚠️ Near</span>) : (<span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>🟢 OK</span>)}
                        </td>
                        <td style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                            {new Date(c.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td>
                            {c.citizenUpdateMessage ? (<span title={c.citizenUpdateMessage}>
                                <MessageSquare size={14} color="var(--primary)" />
                            </span>) : null}
                        </td>
                    </tr>))}
                    {sorted.length === 0 && (<tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No complaints found</td></tr>)}
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

        {selected && <ComplaintDetailModal complaint={selected} onClose={() => setSelected(null)} />}

        {showExportSummary && (<div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowExportSummary(false)}>
            <div className="modal modal-sm">
                <div className="modal-header">
                    <span className="modal-title">Export Summary</span>
                    <button onClick={() => setShowExportSummary(false)} className="btn btn-ghost btn-sm"><X size={17} /></button>
                </div>
                <div className="modal-body">
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 12 }}>
                        You are exporting <strong>{exportRowsSource.length}</strong> complaint record(s).
                    </div>
                    <div style={{ background: 'var(--neutral)', border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>Export By</div>
                        <select className="form-control" value={exportMode} onChange={e => setExportMode(e.target.value)} style={{ marginBottom: 12 }}>
                            <option value="entire">Entire</option>
                            <option value="status">Status</option>
                            <option value="priority">Priority</option>
                            <option value="date">Date</option>
                        </select>

                        {exportMode === 'status' && (<>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>Select Status</div>
                            <select className="form-control" value={exportStatusValue} onChange={e => setExportStatusValue(e.target.value)} style={{ marginBottom: 12 }}>
                                <option value="all">All Status</option>
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </>)}

                        {exportMode === 'priority' && (<>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>Select Priority</div>
                            <select className="form-control" value={exportPriorityValue} onChange={e => setExportPriorityValue(e.target.value)} style={{ marginBottom: 12 }}>
                                <option value="all">All Priority</option>
                                <option value="urgent">Urgent</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </>)}

                        {exportMode === 'date' && (<>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>Select Date Range</div>
                            <select className="form-control" value={exportDateValue} onChange={e => setExportDateValue(e.target.value)} style={{ marginBottom: 12 }}>
                                <option value="all">All Dates</option>
                                <option value="today">Today</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                            </select>
                        </>)}

                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>File</div>
                        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12 }}>{exportFileName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>Current View Filters</div>
                        <div style={{ fontSize: 12, display: 'grid', gap: 4 }}>
                            <div>Department: <strong>{activeDept}</strong></div>
                            <div>Status: <strong>{statusFilter}</strong></div>
                            <div>Priority: <strong>{priorityFilter}</strong></div>
                            <div>Date: <strong>{dateFilter}</strong></div>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-outline" onClick={() => setShowExportSummary(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => {
                        runComplaintsCsvExport();
                        setShowExportSummary(false);
                    }}>
                        Export Now
                    </button>
                </div>
            </div>
        </div>)}
    </div>);
}
