import { useState, useEffect, useMemo, useRef } from 'react';
import { useAdminStore } from '../store/adminStore';
import { LayoutDashboard, FileText, Zap, Receipt, GitBranch, Bell, LogOut, ChevronDown, Search, Users, Shield, RefreshCw, ClipboardList, Monitor, Database } from 'lucide-react';
import { canApproveConnections, canSwitchAllDepartments, canViewAnalytics } from '../utils/permissions';
const DEPT_COLORS = {
    electricity: '#D97706',
    water: '#0369A1',
    gas: '#DC2626',
    municipal: '#15803D',
    all: '#6D28D9',
};
const DEPT_LABELS = {
    electricity: '⚡ Electricity',
    water: '💧 Water',
    gas: '🔥 Gas',
    municipal: '🏛️ Municipal',
    all: '🏛️ All Departments',
};
export function AdminLayout({ children, activeRoute, onNavigate }) {
    const { adminUser, logoutAdmin, complaints, bills, connections, requests, markAsChecked, markAllAsChecked, activeDept, setActiveDept, fetchAllData } = useAdminStore();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchRef = useRef(null);
    const deptColor = DEPT_COLORS[adminUser?.department || 'all'];
    // Filter by !checked and by department if needed (although the store might already do some filtering, 
    // it's safer to ensure we only count what the admin can see)
    const unreadComplaints = complaints.filter(c => !c.checked && (adminUser?.department === 'all' || c.serviceType === adminUser?.department)).length;
    const unreadBills = bills.filter(b => !b.checked && (adminUser?.department === 'all' || b.serviceType === adminUser?.department)).length;
    const unreadConnections = connections.filter(c => !c.checked && (adminUser?.department === 'all' || c.serviceType === adminUser?.department)).length;
    const unreadRequests = requests.filter(r => !r.checked && (adminUser?.department === 'all' || r.serviceType === adminUser?.department)).length;
    const totalNotifications = unreadComplaints + unreadBills + unreadConnections + unreadRequests;
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);
    const isVisibleForSearch = (serviceType) => {
        if (activeDept !== 'all')
            return serviceType === activeDept;
        if (adminUser?.department && adminUser.department !== 'all')
            return serviceType === adminUser.department;
        return true;
    };
    const searchResults = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query)
            return [];
        const complaintMatches = complaints
            .filter(c => isVisibleForSearch(c.serviceType))
            .filter(c => c.complaintId.toLowerCase().includes(query) ||
                c.citizenName.toLowerCase().includes(query) ||
                c.citizenMobile.toLowerCase().includes(query) ||
                c.consumerId.toLowerCase().includes(query) ||
                c.description.toLowerCase().includes(query))
            .map(c => ({
                id: `complaint-${c.id}`,
                kind: 'Complaint',
                title: c.complaintId,
                subtitle: `${c.citizenName} · ${c.citizenMobile} · ${c.status.replace('_', ' ')}`,
                route: 'complaints',
                serviceType: c.serviceType,
            }));
        const billMatches = bills
            .filter(b => isVisibleForSearch(b.serviceType))
            .filter(b => b.billNumber.toLowerCase().includes(query) ||
                b.citizenName.toLowerCase().includes(query) ||
                b.consumerId.toLowerCase().includes(query))
            .map(b => ({
                id: `bill-${b.id}`,
                kind: 'Bill',
                title: b.billNumber,
                subtitle: `${b.citizenName} · ${b.consumerId} · ₹${b.amount.toLocaleString('en-IN')}`,
                route: 'billing',
                serviceType: b.serviceType,
            }));
        const connectionMatches = connections
            .filter(c => isVisibleForSearch(c.serviceType))
            .filter(c => c.applicationId.toLowerCase().includes(query) ||
                c.applicantName.toLowerCase().includes(query) ||
                c.mobile.toLowerCase().includes(query) ||
                c.email.toLowerCase().includes(query) ||
                c.propertyAddress.toLowerCase().includes(query))
            .map(c => ({
                id: `connection-${c.id}`,
                kind: 'Connection',
                title: c.applicationId,
                subtitle: `${c.applicantName} · ${c.mobile} · ${c.status.replace('_', ' ')}`,
                route: 'connections',
                serviceType: c.serviceType,
            }));
        const requestMatches = requests
            .filter(r => isVisibleForSearch(r.serviceType))
            .filter(r => r.requestId.toLowerCase().includes(query) ||
                r.citizenName.toLowerCase().includes(query) ||
                r.mobile.toLowerCase().includes(query) ||
                r.requestType.toLowerCase().includes(query))
            .map(r => ({
                id: `request-${r.id}`,
                kind: 'Request',
                title: r.requestId,
                subtitle: `${r.citizenName} · ${r.mobile} · ${r.status.replace('_', ' ')}`,
                route: 'requests',
                serviceType: r.serviceType,
            }));
        return [...complaintMatches, ...billMatches, ...connectionMatches, ...requestMatches].slice(0, 12);
    }, [searchQuery, complaints, bills, connections, requests, activeDept, adminUser?.department]);
    const navItems = [
        { id: 'dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
        { id: 'complaints', icon: <FileText size={16} />, label: 'Complaints', badge: unreadComplaints },
        { id: 'requests', icon: <GitBranch size={16} />, label: 'Service Requests', badge: unreadRequests },
        { id: 'billing', icon: <Receipt size={16} />, label: 'Billing & Alerts', badge: unreadBills },
        { id: 'connections', icon: <Zap size={16} />, label: 'New Connections', badge: unreadConnections },
        { id: 'dept-alerts', icon: <Bell size={16} />, label: 'Dept Alerts' },
        { id: 'users', icon: <Users size={16} />, label: 'Users' },
        { id: 'account-approvals', icon: <ClipboardList size={16} />, label: 'Account Approvals' },
        { id: 'kiosks', icon: <Monitor size={16} />, label: 'Kiosk Monitor' },
        { id: 'device-state', icon: <Database size={16} />, label: 'Device State (Sync)' },
    ].filter(item => {
        if (item.id === 'dashboard')
            return canViewAnalytics(adminUser?.role);
        if (item.id === 'connections')
            return canApproveConnections(adminUser?.role);
        return true;
    });
    const deptSwitcherOptions = canSwitchAllDepartments(adminUser?.role)
        ? [
            { value: 'all', label: '🏛️ All Departments' },
            { value: 'electricity', label: '⚡ Electricity' },
            { value: 'water', label: '💧 Water' },
            { value: 'gas', label: '🔥 Gas' },
            { value: 'municipal', label: '🏛️ Municipal' },
        ]
        : adminUser?.department && adminUser.department !== 'all'
            ? [{ value: adminUser.department, label: DEPT_LABELS[adminUser.department] }]
            : [{ value: 'all', label: '🏛️ All Departments' }];
    return (<div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
            <div className="sidebar-logo">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#0066CC,#004499)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontWeight: 900, fontSize: 14 }}>S</span>
                    </div>
                    <div>
                        <div className="sidebar-logo-title">SUVIDHA</div>
                        <div className="sidebar-logo-sub">Admin Portal</div>
                    </div>
                </div>
            </div>

            <div className="sidebar-dept-badge" style={{ background: `${deptColor}22`, border: `1px solid ${deptColor}44` }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: deptColor }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: deptColor }}>
                    {DEPT_LABELS[adminUser?.department || 'all']}
                </span>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-section-label">Navigation</div>
                {navItems.map(item => (<button key={item.id} className={`sidebar-nav-item ${activeRoute === item.id ? 'active' : ''}`} onClick={() => onNavigate(item.id)}>
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge != null && item.badge > 0 && (<span className="badge">{item.badge}</span>)}
                </button>))}
            </nav>

            <div className="sidebar-footer">
                <button className="sidebar-nav-item" onClick={logoutAdmin} style={{ color: '#F87171' }}>
                    <LogOut size={16} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>

        {/* Main content */}
        <div className="admin-content">
            <header className="admin-topbar">
                <div className="topbar-left">
                    <span className="topbar-breadcrumb">SUVIDHA /</span>
                    <span className="topbar-title" style={{ textTransform: 'capitalize' }}>{activeRoute.replace('-', ' ')}</span>
                </div>
                <div className="topbar-right">
                    <select className="form-control" style={{ width: 190, fontSize: 12, height: 36 }} value={activeDept} onChange={(e) => setActiveDept(e.target.value)} disabled={!canSwitchAllDepartments(adminUser?.role)} title={canSwitchAllDepartments(adminUser?.role) ? 'Switch department' : 'Department locked for your role'}>
                        {deptSwitcherOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                    </select>

                    <div ref={searchRef} style={{ position: 'relative', minWidth: 300 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, minWidth: 300, background: '#fff' }}>
                            <Search size={14} color="var(--text-muted)" />
                            <input value={searchQuery} onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowSearchResults(true);
                            }} onFocus={() => setShowSearchResults(true)} placeholder="Search ID, name, mobile..." style={{ border: 'none', outline: 'none', width: '100%', fontSize: 12, color: 'var(--text-primary)', background: 'transparent' }} />
                        </div>

                        {showSearchResults && (<div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, width: '100%', background: '#fff', border: '1px solid var(--border)', borderRadius: 10, boxShadow: 'var(--shadow-lg)', zIndex: 120, overflow: 'hidden' }}>
                            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text-secondary)', background: '#F8FAFC' }}>
                                {searchQuery.trim() ? `${searchResults.length} result(s)` : 'Type to search complaints, bills, connections, requests'}
                            </div>

                            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                                {searchQuery.trim() && searchResults.length > 0 ? (searchResults.map(result => (<button key={result.id} onClick={() => {
                                    onNavigate(result.route);
                                    setActiveDept(result.serviceType);
                                    setShowSearchResults(false);
                                }} style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent', borderBottom: '1px solid #F1F5F9', padding: '10px 12px', cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{result.title}</div>
                                        <span style={{ fontSize: 10, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: 999 }}>
                                            {result.kind}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>{result.subtitle}</div>
                                </button>))) : searchQuery.trim() ? (<div style={{ padding: '18px 12px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                                    No matching records found.
                                </div>) : null}
                            </div>
                        </div>)}
                    </div>

                    {/* Refresh Button */}
                    <div style={{ position: 'relative' }}>
                        <button
                            className="topbar-icon-btn"
                            title="Refresh Data"
                            onClick={async () => {
                                setIsRefreshing(true);
                                await fetchAllData();
                                setTimeout(() => setIsRefreshing(false), 500); // Visual feedback
                            }}
                            style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                            <RefreshCw size={16} className={isRefreshing ? 'spin-animation' : ''} />
                            <style>{`
                                    .spin-animation {
                                        animation: spin 1s linear infinite;
                                    }
                                    @keyframes spin { 100% { transform: rotate(360deg); } }
                                `}</style>
                        </button>
                    </div>

                    {/* Notifications */}
                    <div style={{ position: 'relative' }}>
                        <button className={`topbar-icon-btn ${showNotifications ? 'active' : ''}`} title="Notifications" onClick={() => {
                            setShowNotifications(!showNotifications);
                            setShowUserMenu(false);
                        }}>
                            <Bell size={16} />
                            {totalNotifications > 0 && <span className="topbar-notif-dot" />}
                        </button>

                        {showNotifications && (<div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', border: '1px solid var(--border)', borderRadius: 10, boxShadow: 'var(--shadow-lg)', minWidth: 300, zIndex: 100, overflow: 'hidden' }}>
                            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
                                <div style={{ fontSize: 14, fontWeight: 700 }}>Notifications</div>
                                <span style={{ fontSize: 11, background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: 10 }}>{totalNotifications} New</span>
                            </div>
                            <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                                {[
                                    { label: 'Complaints to handle', count: unreadComplaints, route: 'complaints', icon: <FileText size={14} color="#3B82F6" /> },
                                    { label: 'Pending connections', count: unreadConnections, route: 'connections', icon: <Zap size={14} color="#D97706" /> },
                                    { label: 'Service requests', count: unreadRequests, route: 'requests', icon: <GitBranch size={14} color="#10B981" /> },
                                    { label: 'Overdue bills', count: unreadBills, route: 'billing', icon: <Receipt size={14} color="#EF4444" /> },
                                ].filter(n => n.count > 0).length > 0 ? ([
                                    { label: 'Complaints to handle', count: unreadComplaints, route: 'complaints', icon: <FileText size={14} color="#3B82F6" /> },
                                    { label: 'Pending connections', count: unreadConnections, route: 'connections', icon: <Zap size={14} color="#D97706" /> },
                                    { label: 'Service requests', count: unreadRequests, route: 'requests', icon: <GitBranch size={14} color="#10B981" /> },
                                    { label: 'Overdue bills', count: unreadBills, route: 'billing', icon: <Receipt size={14} color="#EF4444" /> },
                                ].map((n, i) => n.count > 0 && (<div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => { onNavigate(n.route); setShowNotifications(false); }} onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                        {n.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{n.count} {n.label}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Action required</div>
                                    </div>
                                </div>))) : (<div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <div style={{ marginBottom: 8 }}><Shield size={24} style={{ opacity: 0.2 }} /></div>
                                    <div style={{ fontSize: 13 }}>All caught up! No pending alerts.</div>
                                </div>)}
                            </div>
                            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', textAlign: 'center', background: '#F8FAFC' }}>
                                <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }} onClick={() => { markAllAsChecked(); setShowNotifications(false); }}>
                                    Mark all as read
                                </button>
                            </div>
                        </div>)}
                    </div>

                    <div style={{ position: 'relative' }}>
                        <div className="topbar-user" onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}>
                            <div className="topbar-avatar" style={{ background: deptColor }}>
                                {adminUser?.avatar}
                            </div>
                            <div className="topbar-user-info">
                                <div className="topbar-user-name">{adminUser?.name}</div>
                                <div className="topbar-user-role" style={{ textTransform: 'capitalize' }}>{adminUser?.role?.replace('_', ' ')}</div>
                            </div>
                            <ChevronDown size={14} color="var(--text-muted)" />
                        </div>
                        {showUserMenu && (<div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', border: '1px solid var(--border)', borderRadius: 10, boxShadow: 'var(--shadow-md)', minWidth: 180, zIndex: 100, overflow: 'hidden' }}>
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{adminUser?.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{adminUser?.email}</div>
                            </div>
                            <button onClick={() => { setShowUserMenu(false); logoutAdmin(); }} style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                                <LogOut size={14} />
                                Sign out
                            </button>
                        </div>)}
                    </div>
                </div>
            </header>

            <main className="admin-main">
                {children}
            </main>
        </div>
    </div>);
}
