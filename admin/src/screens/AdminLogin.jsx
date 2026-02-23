import { useState } from 'react';
import { useAdminStore } from '../store/adminStore';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
const DEPT_OPTIONS = [
    { id: 'SUPER-ADMIN-000', label: 'Super Admin', sub: 'All Departments', icon: '🏛️', color: '#7C3AED', bg: '#F3E8FF' },
    { id: 'ELEC-ADMIN-001', label: 'Electricity Department', sub: 'ELEC-ADMIN-001', icon: '⚡', color: '#D97706', bg: '#FEF3C7' },
    { id: 'WATER-ADMIN-002', label: 'Water Department', sub: 'WATER-ADMIN-002', icon: '💧', color: '#0369A1', bg: '#E0F2FE' },
    { id: 'GAS-ADMIN-003', label: 'Gas Department', sub: 'GAS-ADMIN-003', icon: '🔥', color: '#DC2626', bg: '#FEE2E2' },
    { id: 'MUNI-ADMIN-004', label: 'Municipal Services', sub: 'MUNI-ADMIN-004', icon: '🏗️', color: '#15803D', bg: '#DCFCE7' },
];
export function AdminLogin({ onRegister }) {
    const { loginAdmin } = useAdminStore();
    const [selectedDept, setSelectedDept] = useState('SUPER-ADMIN-000');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleLogin = async () => {
        setError('');
        if (!password) {
            setError('Please enter your password.');
            return;
        }
        setLoading(true);
        // Direct check to avoid confusion with delays
        try {
            const ok = await loginAdmin(selectedDept, password);
            if (!ok) {
                setError('Invalid credentials. Please use the demo password below.');
                setLoading(false);
            }
        } catch (e) {
            setError('An error occurred during login.');
            setLoading(false);
        }
    };
    const copyDemoPw = () => {
        navigator.clipboard.writeText('admin@123');
        const btn = document.getElementById('copy-pw-btn');
        if (btn)
            btn.innerText = 'Copied!';
        setTimeout(() => {
            if (btn)
                btn.innerText = 'Copy Password';
        }, 2000);
    };
    const selected = DEPT_OPTIONS.find(d => d.id === selectedDept);
    return (<div className="login-page">
        <div className="login-bg-pattern" />

        {/* Left branding */}
        <div className="login-left">
            <div style={{ marginBottom: 32 }}>
                <div style={{ width: 60, height: 60, borderRadius: 14, background: 'linear-gradient(135deg,#0066CC,#004499)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                    <Shield size={30} color="#fff" />
                </div>
                <h1 style={{ fontSize: 42, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 12 }}>
                    SUVIDHA<br />Admin Portal
                </h1>
                <p style={{ fontSize: 16, color: '#94A3B8', lineHeight: 1.7, maxWidth: 420 }}>
                    Unified command center for municipal and utility administrators. Manage citizen services across all departments from a single interface.
                </p>
            </div>

            {/* Feature pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 40 }}>
                {['Complaint Management', 'Billing & Alerts', 'Dept Alerts', 'Connection Approvals', 'Service Requests', 'Kiosk Monitoring'].map(f => (<span key={f} style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.08)', color: '#CBD5E1', fontSize: 12, fontWeight: 500 }}>
                    ✓ {f}
                </span>))}
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 32 }}>
                {[{ v: '16', l: 'Kiosks' }, { v: '4', l: 'Departments' }, { v: '24/7', l: 'Monitoring' }].map(s => (<div key={s.l}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#fff' }}>{s.v}</div>
                    <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{s.l}</div>
                </div>))}
            </div>
        </div>

        {/* Right form */}
        <div className="login-right">
            <div className="login-form-card">
                <div style={{ marginBottom: 28 }}>
                    <h2 className="login-title">Welcome Back</h2>
                    <p className="login-subtitle">Sign in to your admin account</p>
                </div>

                {/* Dept selector */}
                <div className="form-group">
                    <label className="form-label">Select Department</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {DEPT_OPTIONS.map(d => (<div key={d.id} className={`dept-select-card ${selectedDept === d.id ? 'selected' : ''}`} onClick={() => { setSelectedDept(d.id); setPassword(''); setError(''); }}>
                            <div className="dept-icon" style={{ background: d.bg }}>
                                {d.icon}
                            </div>
                            <div>
                                <div className="dept-name">{d.label}</div>
                                <div className="dept-id">{d.sub}</div>
                            </div>
                            {selectedDept === d.id && (<div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>
                            </div>)}
                        </div>))}
                    </div>
                </div>

                {/* Password */}
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <div style={{ position: 'relative' }}>
                        <input type={showPw ? 'text' : 'password'} className="form-control" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Enter your password" style={{ paddingRight: 44 }} autoFocus />
                        <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    {/* More Prominent Demo Hint */}
                    <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: 'rgba(0,102,204,0.05)', border: '1px dashed var(--primary)' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Demo Credentials:</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <code style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>admin@123</code>
                            <button id="copy-pw-btn" type="button" onClick={copyDemoPw} style={{ fontSize: 10, background: 'var(--primary)', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>
                                Copy Password
                            </button>
                        </div>
                    </div>
                </div>

                {error && (<div className="alert alert-danger" style={{ marginBottom: 16 }}>
                    <AlertCircle size={15} />
                    <span>{error}</span>
                </div>)}

                <button className="btn btn-primary btn-lg w-full" onClick={handleLogin} disabled={loading} style={{ justifyContent: 'center' }}>
                    {loading ? (<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        Signing in...
                    </span>) : `Sign in as ${selected.label}`}
                </button>

                <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                </div>

                <p style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: 'var(--text-muted)' }}>
                    🔒 Secured access • Role-based permissions
                </p>
            </div>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>);
}
