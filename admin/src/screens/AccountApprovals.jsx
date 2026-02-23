import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

const DEPT_FIELDS = {
    ELECTRICITY: [
        { key: 'connectionType', label: 'Connection Type', type: 'select', options: ['DOMESTIC', 'COMMERCIAL', 'INDUSTRIAL'], required: true },
        { key: 'sanctionedLoad', label: 'Sanctioned Load', type: 'text', required: true },
        { key: 'currentMonthUsage', label: 'Current Mo. Usage (kWh)', type: 'number' },
        { key: 'dailyAverage', label: 'Daily Average (kWh)', type: 'number' },
        { key: 'peakLoad', label: 'Peak Load (kW)', type: 'number' },
        { key: 'lastBillAmount', label: 'Last Bill Amount (₹)', type: 'number' },
        { key: 'lastReadingDate', label: 'Last Reading Date', type: 'date' },
    ],
    WATER: [
        { key: 'connectionType', label: 'Connection Type', type: 'select', options: ['DOMESTIC', 'COMMERCIAL', 'INDUSTRIAL'], required: true },
        { key: 'pipeSize', label: 'Pipe Size', type: 'text' },
        { key: 'numberOfTaps', label: 'Number of Taps', type: 'number' },
        { key: 'meterNumber', label: 'Meter Number', type: 'text' },
        { key: 'currentMonthUsage', label: 'Current Mo. Usage (L)', type: 'number' },
        { key: 'dailyAverage', label: 'Daily Average (L)', type: 'number' },
        { key: 'waterPressure', label: 'Water Pressure', type: 'number' },
        { key: 'lastBillAmount', label: 'Last Bill Amount (₹)', type: 'number' },
        { key: 'lastBillDate', label: 'Last Bill Date', type: 'date' },
        { key: 'dueAmount', label: 'Due Amount (₹)', type: 'number' },
        { key: 'lastMeterReading', label: 'Last Meter Reading', type: 'number' },
        { key: 'lastReadingDate', label: 'Last Reading Date', type: 'date' },
        { key: 'nextReadingDate', label: 'Next Reading Date', type: 'date' },
        { key: 'lastQualityTest', label: 'Last Quality Test Date', type: 'date' },
        { key: 'waterQualityStatus', label: 'Water Quality Status', type: 'text' },
        { key: 'phLevel', label: 'pH Level', type: 'number' },
        { key: 'tdsLevel', label: 'TDS Level', type: 'number' },
        { key: 'chlorineLevel', label: 'Chlorine Level', type: 'number' },
        { key: 'turbidityLevel', label: 'Turbidity Level', type: 'number' },
        { key: 'hardnessLevel', label: 'Hardness Level', type: 'number' },
        { key: 'connectionDate', label: 'Connection Date', type: 'date' },
    ],
    GAS: [
        { key: 'connectionType', label: 'Connection Type', type: 'select', options: ['DOMESTIC', 'COMMERCIAL', 'INDUSTRIAL'], required: true },
        { key: 'gasType', label: 'Gas Type', type: 'select', options: ['PNG', 'CNG'], required: true },
        { key: 'pipelineSize', label: 'Pipeline Size', type: 'text' },
        { key: 'currentMonthUsage', label: 'Current Mo. Usage', type: 'number' },
        { key: 'dailyAverage', label: 'Daily Average', type: 'number' },
        { key: 'pressure', label: 'Pressure', type: 'number' },
        { key: 'lastBillAmount', label: 'Last Bill Amount (₹)', type: 'number' },
        { key: 'lastReadingDate', label: 'Last Reading Date', type: 'date' },
        { key: 'nextSafetyCheck', label: 'Next Safety Check', type: 'date' },
    ],
    MUNICIPAL: [
        { key: 'propertyType', label: 'Property Type', type: 'select', options: ['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL'], required: true },
        { key: 'propertyArea', label: 'Property Area (sq.ft)', type: 'number' },
        { key: 'propertyValue', label: 'Property Value (₹)', type: 'number' },
        { key: 'constructionYear', label: 'Construction Year', type: 'number' },
        { key: 'numberOfFloors', label: 'Number of Floors', type: 'number' },
        { key: 'annualTaxAmount', label: 'Annual Tax Amount (₹)', type: 'number' },
        { key: 'taxCategory', label: 'Tax Category', type: 'text' },
        { key: 'lastBillAmount', label: 'Last Bill Amount (₹)', type: 'number' },
        { key: 'lastBillDate', label: 'Last Bill Date', type: 'date' },
        { key: 'dueAmount', label: 'Due Amount (₹)', type: 'number' },
        { key: 'garbageCollection', label: 'Garbage Collection (true/false)', type: 'select', options: ['true', 'false'] },
        { key: 'drainageConnection', label: 'Drainage Connection (true/false)', type: 'select', options: ['true', 'false'] },
        { key: 'streetLightCoverage', label: 'Street Light Coverage (true/false)', type: 'select', options: ['true', 'false'] },
        { key: 'registrationDate', label: 'Registration Date', type: 'date' },
    ],
};

const SERVICE_COLORS = {
    ELECTRICITY: { bg: '#FEF3C7', border: '#D97706', text: '#92400E', icon: '⚡' },
    WATER: { bg: '#DBEAFE', border: '#2563EB', text: '#1E3A5F', icon: '💧' },
    GAS: { bg: '#FEE2E2', border: '#DC2626', text: '#7F1D1D', icon: '🔥' },
    MUNICIPAL: { bg: '#DCFCE7', border: '#16A34A', text: '#14532D', icon: '🏛️' },
};

function ApproveModal({ request, onClose, onApproved }) {
    const fields = DEPT_FIELDS[request.serviceType] || [];
    const [formData, setFormData] = useState({});
    const [adminNotes, setAdminNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleApprove = async () => {
        // Check required fields
        for (const field of fields) {
            if (field.required && !formData[field.key]) {
                setError(`${field.label} is required`);
                return;
            }
        }
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post(`/api/admin/account-requests/${request.id}/approve`, { accountData: formData, adminNotes });
            if (!data.success) throw new Error(data.message || 'Approval failed');
            onApproved(request.id);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                <div style={{ marginBottom: 20 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>
                        Approve Account Request
                    </h2>
                    <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                        Enter the account details for <strong>{request.consumerNumber}</strong> ({request.serviceType})
                    </p>
                    <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                        Citizen: <strong>{request.citizen?.fullName}</strong> · {request.citizen?.mobileNumber}
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 14 }}>
                    {fields.map(field => (
                        <div key={field.key}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                                {field.label}{field.required && <span style={{ color: '#EF4444' }}> *</span>}
                            </label>
                            {field.type === 'select' ? (
                                <select
                                    value={formData[field.key] || ''}
                                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #D1D5DB', borderRadius: 8, fontSize: 13, outline: 'none' }}
                                >
                                    <option value="">Select...</option>
                                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            ) : (
                                <input
                                    type={field.type || 'text'}
                                    value={formData[field.key] || ''}
                                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #D1D5DB', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                        Admin Notes (optional)
                    </label>
                    <textarea
                        value={adminNotes}
                        onChange={e => setAdminNotes(e.target.value)}
                        rows={2}
                        placeholder="Any notes for this approval..."
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #D1D5DB', borderRadius: 8, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
                    />
                </div>

                {error && (
                    <div style={{ marginTop: 12, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13, color: '#DC2626' }}>
                        ⚠️ {error}
                    </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                    <button
                        onClick={onClose}
                        style={{ flex: 1, padding: '10px', border: '1.5px solid #D1D5DB', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApprove}
                        disabled={loading}
                        style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, background: '#10B981', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#fff', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Creating Account...' : '✅ Approve & Create Account'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function AccountApprovals() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('PENDING');
    const [approveModal, setApproveModal] = useState(null);
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectNote, setRejectNote] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/admin/account-requests?status=${statusFilter}`);
            if (data.success) setRequests(data.requests);
        } catch (err) {
            console.error('Failed to fetch account requests:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, [statusFilter]);

    const handleReject = async (id) => {
        try {
            const { data } = await axios.post(`/api/admin/account-requests/${id}/reject`, { adminNotes: rejectNote });
            if (data.success) {
                setRequests(prev => prev.filter(r => r.id !== id));
                setRejectingId(null);
                setRejectNote('');
            }
        } catch (err) {
            console.error('Reject failed:', err);
        }
    };

    const handleApproved = (id) => {
        setRequests(prev => prev.filter(r => r.id !== id));
    };

    const statusCounts = { pending: requests.filter(r => r.status === 'PENDING').length };

    return (
        <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>Account Approvals</h1>
                    <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                        Citizens requesting new department accounts. Review and provision accounts here.
                    </p>
                </div>
                <button
                    onClick={fetchRequests}
                    style={{ padding: '8px 16px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600, color: '#374151' }}
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        style={{
                            padding: '6px 16px',
                            borderRadius: 20,
                            border: '1.5px solid',
                            fontSize: 12, fontWeight: 600,
                            cursor: 'pointer',
                            borderColor: statusFilter === s ? '#2563EB' : '#E5E7EB',
                            background: statusFilter === s ? '#EFF6FF' : '#fff',
                            color: statusFilter === s ? '#2563EB' : '#6B7280'
                        }}
                    >
                        {s === 'PENDING' && statusCounts.pending > 0 ? `${s} (${statusCounts.pending})` : s}
                    </button>
                ))}
            </div>

            {/* Request List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 48, color: '#9CA3AF' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                    Loading requests...
                </div>
            ) : requests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 64, background: '#F9FAFB', borderRadius: 16, border: '2px dashed #E5E7EB' }}>
                    <CheckCircle size={40} color="#10B981" style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>All caught up!</p>
                    <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>No {statusFilter.toLowerCase()} account requests</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {requests.map(req => {
                        const colors = SERVICE_COLORS[req.serviceType] || SERVICE_COLORS.ELECTRICITY;
                        const isExpanded = expandedId === req.id;
                        return (
                            <div key={req.id} style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                                {/* Card Header */}
                                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                                        <div style={{ width: 42, height: 42, borderRadius: 10, background: colors.bg, border: `1.5px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                                            {colors.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{req.consumerNumber}</span>
                                                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: colors.bg, color: colors.text, fontWeight: 600, border: `1px solid ${colors.border}` }}>
                                                    {req.serviceType}
                                                </span>
                                                <span style={{
                                                    fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 600,
                                                    background: req.status === 'PENDING' ? '#FEF9C3' : req.status === 'APPROVED' ? '#DCFCE7' : '#FEE2E2',
                                                    color: req.status === 'PENDING' ? '#854D0E' : req.status === 'APPROVED' ? '#14532D' : '#7F1D1D'
                                                }}>
                                                    {req.status === 'PENDING' ? '⏳ Pending' : req.status === 'APPROVED' ? '✅ Approved' : '❌ Rejected'}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>
                                                👤 {req.citizen?.fullName} · 📞 {req.citizen?.mobileNumber} · Requested: {new Date(req.requestedAt).toLocaleDateString('en-IN')}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        {req.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => setApproveModal(req)}
                                                    style={{ padding: '7px 14px', background: '#10B981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                                                >
                                                    <CheckCircle size={13} /> Review & Enter Details
                                                </button>
                                                <button
                                                    onClick={() => setRejectingId(rejectingId === req.id ? null : req.id)}
                                                    style={{ padding: '7px 14px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                                                >
                                                    <XCircle size={13} /> Reject
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : req.id)}
                                            style={{ padding: '6px', background: '#F3F4F6', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#6B7280' }}
                                        >
                                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Reject inline form */}
                                {rejectingId === req.id && (
                                    <div style={{ padding: '12px 20px 16px', borderTop: '1px solid #F3F4F6', background: '#FFF7F7' }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: '#DC2626', marginBottom: 8 }}>Reject Request</div>
                                        <textarea
                                            value={rejectNote}
                                            onChange={e => setRejectNote(e.target.value)}
                                            placeholder="Reason for rejection (optional)"
                                            rows={2}
                                            style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #FECACA', borderRadius: 8, fontSize: 12, resize: 'vertical', marginBottom: 10, boxSizing: 'border-box' }}
                                        />
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={() => { setRejectingId(null); setRejectNote(''); }} style={{ padding: '7px 14px', background: '#fff', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                                            <button onClick={() => handleReject(req.id)} style={{ padding: '7px 16px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Confirm Reject</button>
                                        </div>
                                    </div>
                                )}

                                {/* Expanded details */}
                                {isExpanded && (
                                    <div style={{ padding: '12px 20px 16px', borderTop: '1px solid #F3F4F6', background: '#FAFAFA', display: 'flex', gap: 24, fontSize: 12 }}>
                                        <div><span style={{ color: '#9CA3AF' }}>Aadhaar:</span> {req.citizen?.aadharNumber?.replace(/(.{4})/g, '$1 ').trim()}</div>
                                        <div><span style={{ color: '#9CA3AF' }}>Email:</span> {req.citizen?.email || '—'}</div>
                                        {req.adminNotes && <div><span style={{ color: '#9CA3AF' }}>Admin Notes:</span> {req.adminNotes}</div>}
                                        {req.resolvedAt && <div><span style={{ color: '#9CA3AF' }}>Resolved:</span> {new Date(req.resolvedAt).toLocaleDateString('en-IN')}</div>}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Approve Modal */}
            {approveModal && (
                <ApproveModal
                    request={approveModal}
                    onClose={() => setApproveModal(null)}
                    onApproved={handleApproved}
                />
            )}
        </div>
    );
}
