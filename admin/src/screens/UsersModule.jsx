import { useState } from 'react';
import { useAdminStore } from '../store/adminStore';
import { Phone, Search, FileText, Receipt, Monitor } from 'lucide-react';
const MOCK_USERS = [
    { id: 'U001', name: 'Rajesh Kumar', mobile: '+91 98765 43210', consumerId: 'EC123456789', dept: 'electricity', lastActive: 'Feb 21, 2026 10:30 AM', complaints: 2, bills: 3, lastKiosk: 'Municipal Office K001' },
    { id: 'U002', name: 'Priya Sharma', mobile: '+91 97654 32109', consumerId: 'WC987654321', dept: 'water', lastActive: 'Feb 21, 2026 09:45 AM', complaints: 1, bills: 2, lastKiosk: 'Main Station K002' },
    { id: 'U003', name: 'Amit Patel', mobile: '+91 96543 21098', consumerId: 'GC543216789', dept: 'gas', lastActive: 'Feb 21, 2026 07:15 AM', complaints: 1, bills: 1, lastKiosk: 'Sector 4 Hub K003' },
    { id: 'U004', name: 'Sunita Reddy', mobile: '+91 95432 10987', consumerId: 'MC111222333', dept: 'municipal', lastActive: 'Feb 20, 2026 11:00 AM', complaints: 1, bills: 2, lastKiosk: 'Municipal Office K001' },
];
const DEPT_ICONS = { electricity: '⚡', water: '💧', gas: '🔥', municipal: '🏛️' };
export function UsersModule() {
    const { activeDept } = useAdminStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchedUser, setSearchedUser] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const handleSearch = (e) => {
        e.preventDefault();
        setHasSearched(true);
        if (!searchQuery.trim()) {
            setSearchedUser(null);
            return;
        }
        const lowerQuery = searchQuery.toLowerCase();
        let pool = MOCK_USERS;
        if (activeDept !== 'all') {
            pool = pool.filter(u => u.dept === activeDept);
        }
        const match = pool.find(u => u.mobile.includes(lowerQuery) ||
            u.consumerId.toLowerCase().includes(lowerQuery) ||
            u.name.toLowerCase().includes(lowerQuery));
        setSearchedUser(match || null);
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
                        <Search size={18} className="search-icon"/>
                        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Enter Name, Mobile Number, or Consumer ID..." style={{ fontSize: 16 }} autoFocus/>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }}>
                        Search
                    </button>
                </div>
            </form>

            {/* Results */}
            {hasSearched && (<div className="fade-in">
                    {searchedUser ? (<div className="card" style={{ padding: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 24, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
                                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800 }}>
                                    {searchedUser.name.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{searchedUser.name}</h2>
                                    <div style={{ display: 'flex', gap: 16, color: 'var(--text-secondary)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={14}/> {searchedUser.mobile}</div>
                                        <div style={{ fontFamily: 'monospace' }}>ID: {searchedUser.id}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid-3 grid" style={{ marginTop: 24 }}>
                                <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 12 }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Monitor size={14}/> Last Kiosk Activity
                                    </div>
                                    <div style={{ fontWeight: 600 }}>{searchedUser.lastKiosk}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{searchedUser.lastActive}</div>
                                </div>

                                <div style={{ background: '#FFF3E0', padding: 16, borderRadius: 12 }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <FileText size={14} color="#E65100"/> Total Complaints
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: 24, color: '#E65100' }}>{searchedUser.complaints}</div>
                                </div>

                                <div style={{ background: '#E8F5E9', padding: 16, borderRadius: 12 }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Receipt size={14} color="#2E7D32"/> Total Bills
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: 24, color: '#2E7D32' }}>{searchedUser.bills}</div>
                                </div>
                            </div>

                            <div style={{ marginTop: 24 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Registered Services</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#fff', border: '1px solid var(--border)', borderRadius: 8, width: 'fit-content' }}>
                                    <span style={{ fontSize: 20 }}>{DEPT_ICONS[searchedUser.dept]}</span>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{searchedUser.dept} Department</div>
                                        <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>Consumer: {searchedUser.consumerId}</div>
                                    </div>
                                </div>
                            </div>
                        </div>) : (<div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Search size={32} style={{ margin: '0 auto 16px', opacity: 0.5 }}/>
                            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>No Citizen Found</div>
                            <div style={{ fontSize: 13 }}>We couldn't find any citizen matching that query in your department.</div>
                        </div>)}
                </div>)}
        </div>);
}
