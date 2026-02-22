import { useState } from 'react';
import { Shield, User, Lock, Building2, Hash, AlertCircle, ArrowLeft } from 'lucide-react';
const DEPT_OPTIONS = [
    { id: 'ELEC-ADMIN-001', label: 'Electricity Department', sub: 'ELEC-ADMIN-001', icon: '⚡', color: '#D97706', bg: '#FEF3C7' },
    { id: 'WATER-ADMIN-002', label: 'Water Department', sub: 'WATER-ADMIN-002', icon: '💧', color: '#0369A1', bg: '#E0F2FE' },
    { id: 'GAS-ADMIN-003', label: 'Gas Department', sub: 'GAS-ADMIN-003', icon: '🔥', color: '#DC2626', bg: '#FEE2E2' },
    { id: 'MUNI-ADMIN-004', label: 'Municipal Services', sub: 'MUNI-ADMIN-004', icon: '🏗️', color: '#15803D', bg: '#DCFCE7' },
];
export function AdminRegister({ onBack }) {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [deptNo, setDeptNo] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const handleRegister = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!name || !password || !selectedDept || !deptNo) {
            setError('Please fill in all fields.');
            return;
        }
        setLoading(true);
        // Mock registration logic
        setTimeout(() => {
            setLoading(false);
            setSuccess('Registration request submitted! Your account is pending verification.');
            // Clear form
            setName('');
            setPassword('');
            setSelectedDept('');
            setDeptNo('');
        }, 1500);
    };
    return (<div className="login-page">
            <div className="login-bg-pattern"/>

            <div className="login-left">
                <div style={{ marginBottom: 32 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 14, background: 'linear-gradient(135deg,#0066CC,#004499)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                        <Shield size={30} color="#fff"/>
                    </div>
                    <h1 style={{ fontSize: 42, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 12 }}>
                        Join the<br />SUVIDHA Team
                    </h1>
                    <p style={{ fontSize: 16, color: '#94A3B8', lineHeight: 1.7, maxWidth: 420 }}>
                        Create your administrator account to start managing citizen services and department operations.
                    </p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 40 }}>
                    {['Secure Access', 'Real-time Analytics', 'Citizen Interaction'].map(f => (<span key={f} style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.08)', color: '#CBD5E1', fontSize: 12, fontWeight: 500 }}>
                            ✓ {f}
                        </span>))}
                </div>
            </div>

            <div className="login-right">
                <div className="login-form-card" style={{ maxWidth: 400 }}>
                    <div style={{ marginBottom: 28 }}>
                        {onBack && (<button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 13, marginBottom: 16, padding: 0 }}>
                                <ArrowLeft size={14}/> Back to Login
                            </button>)}
                        <h2 className="login-title">Admin Registration</h2>
                        <p className="login-subtitle">Fill out the form to request access</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}/>
                                <input type="text" className="form-control" style={{ paddingLeft: 40 }} placeholder="Enter your full name" value={name} onChange={e => setName(e.target.value)}/>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}/>
                                <input type="password" className="form-control" style={{ paddingLeft: 40 }} placeholder="Create a strong password" value={password} onChange={e => setPassword(e.target.value)}/>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Department</label>
                            <div style={{ position: 'relative' }}>
                                <Building2 size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}/>
                                <select className="form-control" style={{ paddingLeft: 40 }} value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
                                    <option value="">Select Department</option>
                                    {DEPT_OPTIONS.map(d => (<option key={d.id} value={d.id}>{d.label}</option>))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Department Number</label>
                            <div style={{ position: 'relative' }}>
                                <Hash size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}/>
                                <input type="text" className="form-control" style={{ paddingLeft: 40 }} placeholder="e.g. DEPT-882" value={deptNo} onChange={e => setDeptNo(e.target.value)}/>
                            </div>
                        </div>

                        {error && (<div className="alert alert-danger">
                                <AlertCircle size={15}/>
                                <span>{error}</span>
                            </div>)}

                        {success && (<div className="alert alert-success">
                                <AlertCircle size={15}/>
                                <span>{success}</span>
                            </div>)}

                        <button type="submit" className="btn btn-primary btn-lg w-full" style={{ justifyContent: 'center', marginTop: 12 }} disabled={loading}>
                            {loading ? 'Processing...' : 'Submit Request'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--text-muted)' }}>
                        Note: New accounts are manually approved by system administrators.
                    </p>
                </div>
            </div>
            <style>{`
                .w-full { width: 100%; }
            `}</style>
        </div>);
}
