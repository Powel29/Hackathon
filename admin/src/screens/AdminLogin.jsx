import { useState } from 'react';
import { useAdminStore } from '../store/adminStore';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import logo from '../assets/logo.svg';

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
                setError('Invalid credentials. Please try again.');
                setLoading(false);
            }
        } catch (e) {
            setError('An error occurred during login.');
            setLoading(false);
        }
    };

    const selected = DEPT_OPTIONS.find(d => d.id === selectedDept);

    return (
        <div className="login-page">
            <div className="login-bg-pattern" />

            {/* Left branding */}
            <div className="login-left">
                <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 12 }}>
                        <img
                            src={logo}
                            alt="NextGen Seva Admin"
                            style={{ width: 74, height: 74, objectFit: 'contain', flexShrink: 0 }}
                        />
                        <h1 style={{ fontSize: 34, fontWeight: 900, color: '#fff', lineHeight: 1.1, margin: 0 }}>
                            NextGen Seva<br />Admin Portal
                        </h1>
                    </div>
                    <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.55, maxWidth: 390 }}>
                        Unified command center for municipal and utility administrators. Manage citizen services across all departments from a single interface.
                    </p>
                </div>

                {/* Feature pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                    {['Complaint Management', 'Billing & Alerts', 'Dept Alerts', 'Connection Approvals', 'Service Requests', 'Kiosk Monitoring'].map(f => (
                        <span key={f} style={{
                            padding: '5px 12px', borderRadius: 20,
                            background: 'rgba(255,255,255,0.08)', color: '#CBD5E1', fontSize: 11, fontWeight: 500
                        }}>
                            ✓ {f}
                        </span>
                    ))}
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 20 }}>
                    {[
                        { v: '16', l: 'Kiosks' },
                        { v: '4', l: 'Departments' },
                        { v: '24/7', l: 'Monitoring' }
                    ].map(s => (
                        <div key={s.l}>
                            <div style={{ fontSize: 26, fontWeight: 800, color: '#fff' }}>{s.v}</div>
                            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>{s.l}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right form */}
            <div className="login-right">
                <div className="login-form-card">
                    <div style={{ marginBottom: 14 }}>
                        <h2 className="login-title">Welcome Back</h2>
                        <p className="login-subtitle">Sign in to your admin account</p>
                    </div>

                    {/* Dept selector */}
                    <div className="form-group">
                        <label className="form-label">Select Department</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {DEPT_OPTIONS.map(d => (
                                <div
                                    key={d.id}
                                    className={`dept-select-card ${selectedDept === d.id ? 'selected' : ''}`}
                                    onClick={() => { setSelectedDept(d.id); setPassword(''); setError(''); }}
                                >
                                    <div className="dept-icon" style={{ background: d.bg }}>
                                        {d.icon}
                                    </div>
                                    <div>
                                        <div className="dept-name">{d.label}</div>
                                        <div className="dept-id">{d.sub}</div>
                                    </div>
                                    {selectedDept === d.id && (
                                        <div style={{
                                            marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%',
                                            background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPw ? 'text' : 'password'}
                                className="form-control"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError(''); }}
                                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                placeholder="Enter your password"
                                style={{ paddingRight: 44 }}
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(!showPw)}
                                style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                                }}
                            >
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger" style={{ marginBottom: 16 }}>
                            <AlertCircle size={15} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        className="btn btn-primary btn-lg w-full"
                        onClick={handleLogin}
                        disabled={loading}
                        style={{ justifyContent: 'center' }}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{
                                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)',
                                    borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite'
                                }} />
                                Signing in...
                            </span>
                        ) : `Sign in as ${selected.label}`}
                    </button>

                    <p style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: 'var(--text-muted)' }}>
                        🔒 Secured access • Role-based permissions
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
