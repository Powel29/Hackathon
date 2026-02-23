import { useState } from 'react';
import { useAdminStore } from '../store/adminStore';
import { Edit2, Plus, Trash2, Save, X, CheckCircle } from 'lucide-react';
const DEPT_ALERT_CATEGORIES = {
    electricity: [
        { label: 'Power Alerts', key: 'powerAlerts', emoji: '⚡' },
        { label: 'Safety Alerts', key: 'safetyAlerts', emoji: '⚠️' },
    ],
    water: [
        { label: 'Supply Schedule', key: 'supplySchedule', emoji: '🕐' },
        { label: 'Quality Report', key: 'qualityReport', emoji: '🧪' },
    ],
    gas: [
        { label: 'Safety Alerts', key: 'safetyAlerts', emoji: '🔥' },
        { label: 'Pressure Alerts', key: 'pressureAlerts', emoji: '📊' },
    ],
    municipal: [
        { label: 'Waste Collection', key: 'wasteCollection', emoji: '♻️' },
        { label: 'Municipal Notices', key: 'municipalNotices', emoji: '📋' },
    ],
};
const DEPT_OPTIONS = [
    { dept: 'electricity', label: 'Electricity', icon: '⚡', color: '#D97706' },
    { dept: 'water', label: 'Water', icon: '💧', color: '#0369A1' },
    { dept: 'gas', label: 'Gas', icon: '🔥', color: '#DC2626' },
    { dept: 'municipal', label: 'Municipal', icon: '🏛️', color: '#15803D' },
];
function AlertEditor({ alert, dept, categoryKey, onClose }) {
    const { saveDeptAlert, addDeptAlert } = useAdminStore();
    const isNew = !alert;
    const [title, setTitle] = useState(alert?.title || '');
    const [content, setContent] = useState(alert?.content || '');
    const [type, setType] = useState(alert?.type || 'info');
    const [active, setActive] = useState(alert?.active ?? true);
    const [saved, setSaved] = useState(false);
    const handleSave = () => {
        if (isNew) {
            addDeptAlert(dept, categoryKey, {
                id: Date.now().toString(), title, content, type, active,
                updatedAt: new Date().toISOString()
            });
        }
        else {
            saveDeptAlert(dept, categoryKey, alert.id, { title, content, type, active });
        }
        setSaved(true);
        setTimeout(onClose, 1000);
    };
    return (<div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <span className="modal-title">{isNew ? '➕ Add New Alert' : '✏️ Edit Alert'}</span>
                    <button onClick={onClose} className="btn btn-ghost btn-sm"><X size={17}/></button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">Alert Title</label>
                        <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Scheduled Maintenance – Sector 5"/>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Alert Content (shown on kiosk)</label>
                        <textarea className="form-control" value={content} onChange={e => setContent(e.target.value)} placeholder="Full alert message displayed to citizens..." style={{ minHeight: 120 }}/>
                    </div>
                    <div className="grid-2 grid">
                        <div className="form-group">
                            <label className="form-label">Alert Type</label>
                            <select className="form-control" value={type} onChange={e => setType(e.target.value)}>
                                <option value="info">ℹ️ Info</option>
                                <option value="warning">⚠️ Warning</option>
                                <option value="danger">🚨 Danger / Urgent</option>
                                <option value="success">✅ Success / Good news</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select className="form-control" value={active ? 'active' : 'inactive'} onChange={e => setActive(e.target.value === 'active')}>
                                <option value="active">🟢 Active (visible on kiosk)</option>
                                <option value="inactive">⚫ Inactive (hidden)</option>
                            </select>
                        </div>
                    </div>
                    <div className="alert alert-info">
                        <span>ℹ️</span>
                        <span>Saving this alert will immediately update the content shown to citizens on the kiosk under this department's section.</span>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saved || !title || !content}>
                        {saved ? <><CheckCircle size={14}/> Saved & Published!</> : <><Save size={14}/> Save & Publish</>}
                    </button>
                </div>
            </div>
        </div>);
}
export function DeptAlertsModule() {
    const { deptAlerts, adminUser, activeDept, deleteDeptAlert } = useAdminStore();
    const [selectedDept, setSelectedDept] = useState(activeDept !== 'all' ? activeDept : 'electricity');
    const [editing, setEditing] = useState(null);
    const filteredDepts = DEPT_OPTIONS.filter(d => adminUser?.department === 'all' || adminUser?.department === d.dept);
    const alertCategories = DEPT_ALERT_CATEGORIES[selectedDept];
    const deptData = deptAlerts[selectedDept];
    const TYPE_STYLES = {
        info: { bg: '#E0F7FA', border: '#B2EBF2', color: '#0277BD', label: 'ℹ️ Info' },
        warning: { bg: '#FFF3E0', border: '#FFE082', color: '#E65100', label: '⚠️ Warning' },
        danger: { bg: '#FFEBEE', border: '#FFCDD2', color: '#C62828', label: '🚨 Danger' },
        success: { bg: '#E8F5E9', border: '#C8E6C9', color: '#2E7D32', label: '✅ Success' },
    };
    return (<div className="space-y-4">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Department Alerts & Notices</h1>
                    <p className="page-subtitle">Manage content shown to citizens on kiosk department dashboards</p>
                </div>
            </div>

            {/* Dept tabs */}
            <div style={{ display: 'flex', gap: 8 }}>
                {filteredDepts.map(d => (<button key={d.dept} onClick={() => setSelectedDept(d.dept)} className="btn" style={{
                background: selectedDept === d.dept ? d.color : '#fff',
                color: selectedDept === d.dept ? '#fff' : d.color,
                border: `1.5px solid ${d.color}`,
                gap: 6
            }}>
                        {d.icon} {d.label}
                    </button>))}
            </div>

            {/* Alert categories */}
            <div className="space-y-4">
                {alertCategories.map(cat => {
            const alerts = deptData[cat.key] || [];
            return (<div key={cat.key} className="card">
                            <div className="card-header">
                                <span className="card-title">{cat.emoji} {cat.label}</span>
                                <button className="btn btn-outline btn-sm" onClick={() => setEditing({ alert: null, categoryKey: cat.key })} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Plus size={13}/> Add Alert
                                </button>
                            </div>
                            <div className="card-body" style={{ padding: alerts.length === 0 ? 24 : 0 }}>
                                {alerts.length === 0 ? (<div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                                        No alerts in this category. Click "Add Alert" to create one.
                                    </div>) : (alerts.map(a => (<div key={a.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 14 }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                                    <span style={{
                        padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                        background: TYPE_STYLES[a.type].bg, color: TYPE_STYLES[a.type].color,
                        border: `1px solid ${TYPE_STYLES[a.type].border}`
                    }}>{TYPE_STYLES[a.type].label}</span>
                                                    <span style={{ fontSize: 11, color: a.active ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
                                                        {a.active ? '🟢 Live on Kiosk' : '⚫ Hidden'}
                                                    </span>
                                                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                                        Updated: {new Date(a.updatedAt).toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{a.title}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{a.content}</div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                                                <button className="btn btn-outline btn-sm" onClick={() => setEditing({ alert: a, categoryKey: cat.key })} title="Edit">
                                                    <Edit2 size={13}/>
                                                </button>
                                                <button className="btn btn-sm" style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid var(--danger)' }} onClick={() => deleteDeptAlert(selectedDept, cat.key, a.id)} title="Delete">
                                                    <Trash2 size={13}/>
                                                </button>
                                            </div>
                                        </div>)))}
                            </div>
                        </div>);
        })}
            </div>

            {editing && (<AlertEditor alert={editing.alert} dept={selectedDept} categoryKey={editing.categoryKey} onClose={() => setEditing(null)}/>)}
        </div>);
}
