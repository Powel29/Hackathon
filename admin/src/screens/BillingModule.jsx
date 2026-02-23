import { useState, useMemo, useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';
import { Search, AlertTriangle, CheckCircle, X, Send, Receipt, Download, ChevronDown } from 'lucide-react';
import { canManageBilling } from '../utils/permissions';
function CreateBillModal({ onClose }) {
    const { createBill, activeDept } = useAdminStore();
    const [formData, setFormData] = useState({
        citizenId: '',
        serviceType: activeDept === 'all' ? 'ELECTRICITY' : activeDept.toUpperCase(),
        amount: '',
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        billingPeriod: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        unitsConsumed: '',
        financialYear: '2025-26'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await createBill(formData);
        if (success) {
            onClose();
        } else {
            alert('Failed to create bill. Ensure Citizen ID is correct and account exists.');
        }
        setLoading(false);
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-md">
                <div className="modal-header">
                    <span className="modal-title">✨ Create New Bill</span>
                    <button onClick={onClose} className="btn btn-ghost btn-sm"><X size={17} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body space-y-4">
                        <div className="form-group">
                            <label className="form-label">Citizen Aadhaar Number</label>
                            <input
                                required
                                className="form-control"
                                placeholder="12-digit Aadhaar"
                                value={formData.citizenId}
                                onChange={e => setFormData({ ...formData, citizenId: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">Service Type</label>
                                <select
                                    className="form-control"
                                    value={formData.serviceType}
                                    onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
                                    disabled={activeDept !== 'all'}
                                >
                                    <option value="ELECTRICITY">Electricity</option>
                                    <option value="WATER">Water</option>
                                    <option value="GAS">Gas</option>
                                    <option value="MUNICIPAL">Municipal</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Billing Period</label>
                                <input
                                    className="form-control"
                                    value={formData.billingPeriod}
                                    onChange={e => setFormData({ ...formData, billingPeriod: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">Bill Amount (₹)</label>
                                <input
                                    required
                                    type="number"
                                    className="form-control"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Due Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={formData.dueDate}
                                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                />
                            </div>
                        </div>
                        {formData.serviceType === 'ELECTRICITY' && (
                            <div className="form-group">
                                <label className="form-label">Units Consumed</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={formData.unitsConsumed}
                                    onChange={e => setFormData({ ...formData, unitsConsumed: e.target.value })}
                                />
                            </div>
                        )}
                        {formData.serviceType === 'MUNICIPAL' && (
                            <div className="form-group">
                                <label className="form-label">Financial Year</label>
                                <input
                                    className="form-control"
                                    value={formData.financialYear}
                                    onChange={e => setFormData({ ...formData, financialYear: e.target.value })}
                                />
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Bill'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function BillAlertModal({ bill, onClose }) {
    const { sendBillAlert, adminUser } = useAdminStore();
    const [message, setMessage] = useState(`Dear ${bill.citizenName}, your ${bill.serviceType.toUpperCase()} bill #${bill.billNumber} of ₹${bill.amount} is ${bill.status}. Due date: ${new Date(bill.dueDate).toLocaleDateString('en-IN')}. Please pay immediately to avoid service disruption.`);
    const [sent, setSent] = useState(false);
    const handleSend = () => {
        sendBillAlert(bill.id, message);
        setSent(true);
        setTimeout(onClose, 1200);
    };
    return (<div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal modal-sm">
            <div className="modal-header">
                <span className="modal-title">📣 Send Payment Alert</span>
                <button onClick={onClose} className="btn btn-ghost btn-sm"><X size={17} /></button>
            </div>
            <div className="modal-body">
                <div style={{ background: 'var(--warning-light)', borderRadius: 10, padding: 14, marginBottom: 18, border: '1px solid #FFE082' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Bill Details</div>
                    <div style={{ fontSize: 12 }}>
                        <div>Bill No: <strong>{bill.billNumber}</strong></div>
                        <div>Citizen: <strong>{bill.citizenName}</strong> ({bill.consumerId})</div>
                        <div>Amount: <strong style={{ color: 'var(--danger)', fontSize: 16 }}>₹{bill.amount.toLocaleString('en-IN')}</strong></div>
                        <div>Due Date: <strong>{new Date(bill.dueDate).toLocaleDateString('en-IN')}</strong></div>
                        <div>Status: <span className={`badge badge-${bill.status}`}>{bill.status}</span></div>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Alert Message to Citizen</label>
                    <textarea className="form-control" value={message} onChange={e => setMessage(e.target.value)} style={{ minHeight: 120 }} />
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>This message will appear as an alert on the citizen's bill view on the kiosk.</p>
                </div>
            </div>
            <div className="modal-footer">
                <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                <button className="btn btn-warning" onClick={handleSend} disabled={sent}>
                    {sent ? <><CheckCircle size={14} /> Sent!</> : <><Send size={14} /> Send Alert</>}
                </button>
            </div>
        </div>
    </div>);
}
export function BillingModule() {
    const { bills, activeDept, markAsChecked, adminUser } = useAdminStore();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [alertTarget, setAlertTarget] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState('dueDate');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const filtered = useMemo(() => {
        let list = activeDept === 'all' ? bills : bills.filter(b => b.serviceType === activeDept);
        if (search)
            list = list.filter(b => b.billNumber.includes(search) ||
                b.citizenName.toLowerCase().includes(search.toLowerCase()) ||
                b.consumerId.includes(search));
        if (statusFilter !== 'all')
            list = list.filter(b => b.status === statusFilter);
        return list;
    }, [bills, activeDept, search, statusFilter]);
    const totalRevenue = bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.amount, 0);
    const overdueAmount = bills.filter(b => b.status === 'overdue').reduce((s, b) => s + b.amount, 0);
    const pendingAmount = bills.filter(b => b.status === 'pending').reduce((s, b) => s + b.amount, 0);
    const DEPT_ICONS = { electricity: '⚡', water: '💧', gas: '🔥', municipal: '🏛️' };
    const canEditBilling = canManageBilling(adminUser?.role);
    const statusRank = { pending: 1, overdue: 2, partial: 3, paid: 4 };
    const sorted = useMemo(() => {
        const list = [...filtered];
        list.sort((a, b) => {
            let compareValue = 0;
            if (sortBy === 'dueDate') {
                compareValue = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            else if (sortBy === 'amount') {
                compareValue = a.amount - b.amount;
            }
            else {
                compareValue = (statusRank[a.status] ?? 999) - (statusRank[b.status] ?? 999);
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
        setSortOrder(field === 'dueDate' ? 'asc' : 'desc');
    };
    const sortIndicator = (field) => {
        if (sortBy !== field)
            return <ChevronDown size={12} style={{ opacity: 0.35 }} />;
        return <ChevronDown size={12} style={{ transform: sortOrder === 'asc' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />;
    };
    const exportBillsCsv = () => {
        if (filtered.length === 0) {
            window.alert('No bills available for export with current filters.');
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
            'Bill Number',
            'Department',
            'Citizen',
            'Consumer ID',
            'Billing Period',
            'Amount',
            'Due Date',
            'Status',
            'Alert Sent',
            'Alert Message',
            'Alert Sent At',
        ];
        const rows = filtered.map(b => [
            b.billNumber,
            b.serviceType,
            b.citizenName,
            b.consumerId,
            b.billingPeriod,
            b.amount,
            new Date(b.dueDate).toISOString(),
            b.status,
            b.alertSent ? 'yes' : 'no',
            b.alertMessage,
            b.alertSentAt ? new Date(b.alertSentAt).toISOString() : '',
        ]);
        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => escapeCsv(cell)).join(','))
            .join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const dept = activeDept === 'all' ? 'all-departments' : activeDept;
        const date = new Date().toISOString().slice(0, 10);
        link.href = url;
        link.download = `bills-${dept}-${date}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    return (<div className="space-y-4">
        <div className="page-header">
            <div>
                <h1 className="page-title">Billing & Revenue</h1>
                <p className="page-subtitle">Manage bills, track payments, send payment alerts</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
                {canEditBilling && (
                    <button className="btn btn-primary btn-sm" onClick={() => setIsCreateModalOpen(true)}>
                        ✨ Create New Bill
                    </button>
                )}
                <button className="btn btn-outline btn-sm" onClick={exportBillsCsv} disabled={!canEditBilling}><Download size={14} /> Export</button>
            </div>
        </div>

        {/* Revenue cards */}
        <div className="grid-3 grid">
            <div className="stat-card green">
                <div className="stat-icon" style={{ background: 'var(--success-light)' }}>
                    <Receipt size={20} color="var(--success)" />
                </div>
                <div className="stat-value">₹{(totalRevenue / 1000).toFixed(1)}K</div>
                <div className="stat-label">Total Collected</div>
            </div>
            <div className="stat-card red">
                <div className="stat-icon" style={{ background: 'var(--danger-light)' }}>
                    <AlertTriangle size={20} color="var(--danger)" />
                </div>
                <div className="stat-value">₹{(overdueAmount / 1000).toFixed(1)}K</div>
                <div className="stat-label">Overdue Amount</div>
            </div>
            <div className="stat-card orange">
                <div className="stat-icon" style={{ background: 'var(--warning-light)' }}>
                    <Receipt size={20} color="var(--warning)" />
                </div>
                <div className="stat-value">₹{(pendingAmount / 1000).toFixed(1)}K</div>
                <div className="stat-label">Pending Amount</div>
            </div>
        </div>

        {/* Filters */}
        <div className="filters-row">
            <div className="search-box" style={{ minWidth: 220 }}>
                <Search size={14} className="search-icon" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bill no., name, consumer ID..." />
            </div>
            <select className="form-control" style={{ width: 130 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
            </select>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>{sorted.length} bills</span>
        </div>

        {/* Bills table */}
        <div className="card">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Bill No.</th>
                        <th>Dept</th>
                        <th>Citizen</th>
                        <th>Consumer ID</th>
                        <th>Period</th>
                        <th>
                            <button className="btn btn-ghost btn-sm" style={{ padding: 0, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => toggleSort('amount')}>
                                Amount {sortIndicator('amount')}
                            </button>
                        </th>
                        <th>
                            <button className="btn btn-ghost btn-sm" style={{ padding: 0, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => toggleSort('dueDate')}>
                                Due Date {sortIndicator('dueDate')}
                            </button>
                        </th>
                        <th>
                            <button className="btn btn-ghost btn-sm" style={{ padding: 0, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => toggleSort('status')}>
                                Status {sortIndicator('status')}
                            </button>
                        </th>
                        <th>Alert</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {paginated.map(b => (<tr key={b.id} onClick={() => {
                        if (!b.checked)
                            markAsChecked('bill', b.id);
                    }} style={{ cursor: 'pointer' }}>
                        <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                            {!b.checked && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3B82F6', flexShrink: 0, boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' }} title="Unread" />}
                            {b.billNumber}
                        </td>
                        <td><span title={b.serviceType} style={{ fontSize: 16 }}>{DEPT_ICONS[b.serviceType]}</span></td>
                        <td>
                            <div style={{ fontWeight: 600, fontSize: 12 }}>{b.citizenName}</div>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{b.consumerId}</td>
                        <td style={{ fontSize: 12 }}>{b.billingPeriod}</td>
                        <td style={{ fontWeight: 700, fontSize: 14, color: b.status === 'overdue' ? 'var(--danger)' : 'var(--text-primary)' }}>
                            ₹{b.amount.toLocaleString('en-IN')}
                        </td>
                        <td style={{ fontSize: 12 }}>{new Date(b.dueDate).toLocaleDateString('en-IN')}</td>
                        <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                        <td>
                            {b.alertSent ? (<span title={`Sent: ${b.alertMessage}`} style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>✓ Sent</span>) : <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>–</span>}
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', gap: 6 }}>
                                {b.status !== 'paid' && (<button className="btn btn-warning btn-sm" onClick={() => setAlertTarget(b)} title="Send payment alert" disabled={!canEditBilling}>
                                    📣 Alert
                                </button>)}
                                {b.status === 'paid' && <span style={{ fontSize: 11, color: 'var(--success)' }}>✓ Settled</span>}
                            </div>
                        </td>
                    </tr>))}
                    {sorted.length === 0 && (<tr><td colSpan={10} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No bills found</td></tr>)}
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

        {alertTarget && <BillAlertModal bill={alertTarget} onClose={() => setAlertTarget(null)} />}
        {isCreateModalOpen && <CreateBillModal onClose={() => setIsCreateModalOpen(false)} />}
    </div>);
}
