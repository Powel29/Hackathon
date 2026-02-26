import { useState, useMemo, useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';
import { Search, X, FileText, ExternalLink, ChevronDown } from 'lucide-react';
import { canApproveConnections } from '../utils/permissions';
function DocumentViewer({ doc, onClose }) {
    const isPDF = doc.type === 'pdf' || doc.name.toLowerCase().endsWith('.pdf');
    // If we have a real dataUrl, use it; otherwise show a placeholder
    const hasData = doc.dataUrl && doc.dataUrl.length > 100;
    const blobUrl = hasData
        ? (isPDF
            ? `data:application/pdf;base64,${doc.dataUrl.replace(/^data:[^;]+;base64,/, '')}`
            : doc.dataUrl)
        : null;
    return (<div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal modal-lg" style={{ maxHeight: '90vh' }}>
            <div className="modal-header">
                <span className="modal-title">📄 {doc.name}</span>
                <button onClick={onClose} className="btn btn-ghost btn-sm"><X size={17} /></button>
            </div>
            <div className="doc-viewer" style={{ minHeight: 500, borderRadius: 0 }}>
                <div className="doc-viewer-toolbar">
                    <span style={{ fontSize: 12, color: '#94A3B8' }}>{doc.name}</span>
                    <span style={{ fontSize: 11, color: '#64748B', padding: '3px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
                        {isPDF ? 'PDF Document' : 'Image'}
                    </span>
                </div>
                <div className="doc-viewer-content" style={{ flex: 1, padding: 0 }}>
                    {hasData ? (isPDF ? (<iframe src={blobUrl} style={{ width: '100%', height: 500, border: 'none' }} title={doc.name} />) : (<img src={doc.dataUrl} alt={doc.name} style={{ maxWidth: '100%', maxHeight: 500, borderRadius: 8 }} />)) : (<div style={{ textAlign: 'center', color: '#64748B' }}>
                        <div style={{ fontSize: 60, marginBottom: 16 }}>{isPDF ? '📄' : '🖼️'}</div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#94A3B8', marginBottom: 8 }}>{doc.name}</div>
                        <div style={{ fontSize: 13, color: '#475569' }}>
                            {isPDF ? 'PDF document' : 'Image file'} — uploaded by citizen
                        </div>
                        <div style={{ marginTop: 16, padding: '10px 20px', background: 'rgba(0,102,204,0.15)', borderRadius: 8, fontSize: 12, color: '#90CAF9', maxWidth: 360, margin: '16px auto 0' }}>
                            ℹ️ In production, uploaded documents are stored securely and displayed here without requiring local download.
                        </div>
                    </div>)}
                </div>
            </div>
        </div>
    </div>);
}
function ConnectionDetailModal({ conn, onClose }) {
    const { updateConnectionStatus, adminUser } = useAdminStore();
    const [status, setStatus] = useState(conn.status);
    const [notes, setNotes] = useState(conn.adminNotes);
    const [rejReason, setRejReason] = useState(conn.rejectionReason);
    const [viewDoc, setViewDoc] = useState(null);
    const [saved, setSaved] = useState(false);
    const addressText = conn.propertyAddress?.trim() || '';
    const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    // Use exact lat/lng if available from MapAddressPicker
    const hasCoords = conn.latitude && conn.longitude;
    const encodedAddress = encodeURIComponent(addressText);
    // Prefer coordinates over text query for map pin accuracy
    const mapQuery = hasCoords ? `${conn.latitude},${conn.longitude}` : encodedAddress;

    const mapEmbedSrc = (hasCoords || addressText)
        ? mapsApiKey
            ? `https://www.google.com/maps/embed/v1/place?key=${mapsApiKey}&q=${mapQuery}`
            : `https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`
        : '';

    const mapOpenUrl = (hasCoords || addressText)
        ? `https://www.google.com/maps/search/?api=1&query=${mapQuery}`
        : '';
    const canEditConnection = canApproveConnections(adminUser?.role);
    const handleSave = () => {
        updateConnectionStatus(conn.id, status, notes, rejReason);
        setSaved(true);
        setTimeout(onClose, 1200);
    };
    return (<div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal modal-lg">
            <div className="modal-header">
                <div>
                    <span className="modal-title">Application #{conn.applicationId}</span>
                    <span className={`badge badge-${conn.status}`} style={{ marginLeft: 10 }}>{conn.status.replace('_', ' ')}</span>
                </div>
                <button onClick={onClose} className="btn btn-ghost btn-sm"><X size={17} /></button>
            </div>
            <div className="modal-body">
                <div className="grid-2 grid" style={{ marginBottom: 20 }}>
                    <div style={{ background: 'var(--neutral)', borderRadius: 10, padding: 16 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>👤 Applicant Information</div>
                        {[['Name', conn.applicantName], ['Mobile', conn.mobile], ['Email', conn.email], ['Service', `${conn.serviceType.toUpperCase()} – ${conn.connectionType}`], ['Address', conn.propertyAddress]].map(([k, v]) => (<div key={k} style={{ display: 'flex', fontSize: 12, marginBottom: 8 }}>
                            <span style={{ color: 'var(--text-secondary)', width: 70, flexShrink: 0 }}>{k}</span>
                            <span style={{ fontWeight: 600 }}>{v}</span>
                        </div>))}
                    </div>
                    <div style={{ background: 'var(--neutral)', borderRadius: 10, padding: 16 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>📎 Uploaded Documents</div>
                        <div className="space-y-3">
                            {conn.documents.map((doc, i) => (<div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 18 }}>{doc.type === 'pdf' ? '📄' : '🖼️'}</span>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 600 }}>{doc.name}</div>
                                        <div style={{ fontSize: 10, color: doc.verified ? 'var(--success)' : 'var(--warning)' }}>
                                            {doc.verified ? '✓ Verified' : '⏳ Pending verification'}
                                        </div>
                                    </div>
                                </div>
                                <button className="btn btn-outline btn-sm" onClick={() => setViewDoc(doc)} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <ExternalLink size={12} /> View
                                </button>
                            </div>))}
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>📍 Property Location Map</div>
                    <div style={{ background: 'var(--neutral)', borderRadius: 10, padding: 12, border: '1px solid var(--border)' }}>
                        {mapEmbedSrc ? (<>
                            <iframe title={`Property map for application ${conn.applicationId}`} src={mapEmbedSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" style={{ width: '100%', height: 260, border: 'none', borderRadius: 8, background: '#fff' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 10 }}>
                                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                    Address: {addressText}
                                </span>
                                <a href={mapOpenUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                                    Open in Google Maps ↗
                                </a>
                            </div>
                            {!mapsApiKey && (<div style={{ marginTop: 8, fontSize: 11, color: 'var(--warning)' }}>
                                Add <strong>VITE_GOOGLE_MAPS_API_KEY</strong> in <strong>admin/.env</strong> to use official Google Maps Embed API.
                            </div>)}
                        </>) : (<div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            No property address available for this application.
                        </div>)}
                    </div>
                </div>

                <hr className="divider" />

                {/* Admin decision */}
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>⚡ Approval Decision</div>
                    <div className="form-group">
                        <label className="form-label">Update Status</label>
                        <select className="form-control" value={status} onChange={e => setStatus(e.target.value)} disabled={!canEditConnection}>
                            <option value="pending">Pending</option>
                            <option value="document_verification">Document Verification</option>
                            <option value="field_inspection">Field Inspection</option>
                            <option value="approved">✅ Approved</option>
                            <option value="rejected">❌ Rejected</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Internal Notes</label>
                        <textarea className="form-control" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Internal admin notes..." style={{ minHeight: 70 }} disabled={!canEditConnection} />
                    </div>
                    {status === 'rejected' && (<div className="form-group">
                        <label className="form-label">Rejection Reason (shown to applicant)</label>
                        <textarea className="form-control" value={rejReason} onChange={e => setRejReason(e.target.value)} placeholder="Reason for rejection..." style={{ minHeight: 70 }} disabled={!canEditConnection} />
                    </div>)}
                </div>

                {/* Timeline */}
                <div>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>📋 Application Timeline</div>
                    <div className="timeline">
                        {[...conn.statusHistory].reverse().map((h, i) => (<div key={i} className="timeline-item">
                            <div className={`timeline-dot ${h.status === 'approved' ? 'green' : h.status === 'rejected' ? 'red' : ''}`} />
                            <div className="timeline-content">
                                <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{h.status.replace('_', ' ')} <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>by {h.by}</span></div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{h.note}</div>
                                <div className="timeline-time">{new Date(h.timestamp).toLocaleString('en-IN')}</div>
                            </div>
                        </div>))}
                    </div>
                </div>
            </div>
            <div className="modal-footer">
                <button className="btn btn-outline" onClick={onClose}>Close</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saved || !canEditConnection}>
                    {saved ? '✓ Saved' : 'Save Decision'}
                </button>
            </div>
        </div>
        {viewDoc && <DocumentViewer doc={viewDoc} onClose={() => setViewDoc(null)} />}
    </div>);
}
export function ConnectionsModule() {
    const { connections, activeDept, markAsChecked } = useAdminStore();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const [sortBy, setSortBy] = useState('appliedAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const filtered = useMemo(() => {
        let list = activeDept === 'all' ? connections : connections.filter(c => c.serviceType === activeDept);
        if (search)
            list = list.filter(c => c.applicationId.includes(search) || c.applicantName.toLowerCase().includes(search.toLowerCase()));
        if (statusFilter !== 'all')
            list = list.filter(c => c.status === statusFilter);
        return list;
    }, [connections, activeDept, search, statusFilter]);
    const DEPT_ICONS = { electricity: '⚡', water: '💧', gas: '🔥', municipal: '🏛️' };
    const statusRank = {
        pending: 1,
        document_verification: 2,
        field_inspection: 3,
        approved: 4,
        rejected: 5,
    };
    const sorted = useMemo(() => {
        const list = [...filtered];
        list.sort((a, b) => {
            let compareValue = 0;
            if (sortBy === 'appliedAt') {
                compareValue = new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime();
            }
            else if (sortBy === 'status') {
                compareValue = (statusRank[a.status] ?? 999) - (statusRank[b.status] ?? 999);
            }
            else {
                compareValue = a.applicantName.localeCompare(b.applicantName);
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
        setSortOrder(field === 'appliedAt' ? 'desc' : 'asc');
    };
    const sortIndicator = (field) => {
        if (sortBy !== field)
            return <ChevronDown size={12} style={{ opacity: 0.35 }} />;
        return <ChevronDown size={12} style={{ transform: sortOrder === 'asc' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />;
    };
    return (<div className="space-y-4">
        <div className="page-header">
            <div>
                <h1 className="page-title">New Connection Applications</h1>
                <p className="page-subtitle">Review, verify documents, and approve or reject applications</p>
            </div>
        </div>

        <div className="filters-row">
            <div className="search-box" style={{ minWidth: 220 }}>
                <Search size={14} className="search-icon" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search application ID or name..." />
            </div>
            <select className="form-control" style={{ width: 190 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="document_verification">Document Verification</option>
                <option value="field_inspection">Field Inspection</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
            </select>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>{sorted.length} applications</span>
        </div>

        <div className="card">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Application ID</th>
                        <th>Dept</th>
                        <th>
                            <button className="btn btn-ghost btn-sm" style={{ padding: 0, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => toggleSort('applicantName')}>
                                Applicant {sortIndicator('applicantName')}
                            </button>
                        </th>
                        <th>Connection Type</th>
                        <th>Documents</th>
                        <th>
                            <button className="btn btn-ghost btn-sm" style={{ padding: 0, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => toggleSort('appliedAt')}>
                                Applied On {sortIndicator('appliedAt')}
                            </button>
                        </th>
                        <th>
                            <button className="btn btn-ghost btn-sm" style={{ padding: 0, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => toggleSort('status')}>
                                Status {sortIndicator('status')}
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {paginated.map(c => (<tr key={c.id} onClick={() => {
                        setSelected(c); if (!c.checked)
                            markAsChecked('connection', c.id);
                    }} style={{ cursor: 'pointer' }}>
                        <td style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 600, fontSize: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {!c.checked && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3B82F6', flexShrink: 0, boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' }} title="Unread" />}
                                {c.applicationId}
                            </div>
                        </td>
                        <td><span title={c.serviceType} style={{ fontSize: 16 }}>{DEPT_ICONS[c.serviceType]}</span></td>
                        <td>
                            <div style={{ fontWeight: 600, fontSize: 12 }}>{c.applicantName}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{c.mobile}</div>
                        </td>
                        <td style={{ fontSize: 12, textTransform: 'capitalize' }}>{c.connectionType}</td>
                        <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <FileText size={13} color="var(--text-secondary)" />
                                <span style={{ fontSize: 12 }}>{c.documents.length} docs</span>
                                {c.documents.some(d => !d.verified) && <span style={{ fontSize: 10, color: 'var(--warning)', fontWeight: 700 }}>⚠</span>}
                            </div>
                        </td>
                        <td style={{ fontSize: 12 }}>{new Date(c.appliedAt).toLocaleDateString('en-IN')}</td>
                        <td><span className={`badge badge-${c.status}`}>{c.status.replace('_', ' ')}</span></td>
                    </tr>))}
                    {sorted.length === 0 && (<tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No applications found</td></tr>)}
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

        {selected && <ConnectionDetailModal conn={selected} onClose={() => setSelected(null)} />}
    </div>);
}
