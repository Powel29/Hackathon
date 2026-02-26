import { useState } from 'react';
import { useAdminStore } from '../store/adminStore';
import { Phone, Search, FileText, Receipt, Monitor } from 'lucide-react';

const DEPT_ICONS = { electricity: '⚡', water: '💧', gas: '🔥', municipal: '🏛️', registered: '👤' };

export function UsersModule() {
    const { activeDept, searchCitizen } = useAdminStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchedUser, setSearchedUser] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setHasSearched(true);
        if (!searchQuery.trim()) {
            setSearchedUser(null);
            return;
        }

        setLoading(true);
        const results = await searchCitizen(searchQuery);

        let pool = results;
        if (activeDept !== 'all') {
            pool = pool.filter(u => u.dept === activeDept || u.dept === 'registered');
        }

        setSearchedUser(pool.length > 0 ? pool[0] : null);
        setLoading(false);
    };
    return (<div className="space-y-6 max-w-4xl mx-auto">
        <div className="page-header">
            <div>
                <h1 className="page-title">Citizen Lookup</h1>
                <p className="page-subtitle">Search to view a specific citizen's profile and kiosk activity</p>
            </div>
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="card p-6" style={{ padding: 24 }}>
            <div style={{ display: 'flex', gap: 12 }}>
                <div className="search-box" style={{ flex: 1, height: 48 }}>
                    <Search size={18} className="search-icon" />
                    <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Enter Name, Mobile Number, or Consumer ID..." style={{ fontSize: 16 }} autoFocus />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }}>
                    Search
                </button>
            </div>
        </form>

        {/* Results */}
        {hasSearched && (<div className="fade-in">
            {loading ? (
                <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{
                        width: 32, height: 32, border: '3px solid var(--border)',
                        borderTopColor: 'var(--primary)', borderRadius: '50%',
                        animation: 'spin 1s linear infinite', margin: '0 auto 16px'
                    }} />
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Searching Database...</div>
                    <div style={{ fontSize: 13 }}>Please wait while we look up the citizen records.</div>
                    <style>{`
                        @keyframes spin { to { transform: rotate(360deg); } }
                    `}</style>
                </div>
            ) : searchedUser ? (<div className="card" style={{ padding: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800 }}>
                        {searchedUser.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{searchedUser.name}</h2>
                        <div style={{ display: 'flex', gap: 16, color: 'var(--text-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={14} /> {searchedUser.mobile}</div>
                            <div style={{ fontFamily: 'monospace' }}>ID: {searchedUser.rawId || searchedUser.id}</div>
                        </div>
                    </div>
                </div>

                <div className="grid-3 grid" style={{ marginTop: 24 }}>
                    <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 12 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Monitor size={14} /> Last Kiosk Activity
                        </div>
                        <div style={{ fontWeight: 600 }}>{searchedUser.lastKiosk}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{searchedUser.lastActive}</div>
                    </div>

                    <div style={{ background: '#FFF3E0', padding: 16, borderRadius: 12 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FileText size={14} color="#E65100" /> Total Complaints
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 24, color: '#E65100' }}>{searchedUser.complaints}</div>
                    </div>

                    <div style={{ background: '#E8F5E9', padding: 16, borderRadius: 12 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Receipt size={14} color="#2E7D32" /> Total Bills
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 24, color: '#2E7D32' }}>{searchedUser.bills}</div>
                    </div>
                </div>

                <div style={{ marginTop: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Registered Services</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#fff', border: '1px solid var(--border)', borderRadius: 8, width: 'fit-content' }}>
                        <span style={{ fontSize: 20 }}>{DEPT_ICONS[searchedUser.dept] || DEPT_ICONS.registered}</span>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{searchedUser.dept} Department</div>
                            <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>Consumer: {searchedUser.consumerId}</div>
                        </div>
                    </div>
                </div>
            </div>) : (<div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                <Search size={32} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>No Citizen Found</div>
                <div style={{ fontSize: 13 }}>We couldn't find any citizen matching that query in your department.</div>
            </div>)}
        </div>)}
    </div>);
}
