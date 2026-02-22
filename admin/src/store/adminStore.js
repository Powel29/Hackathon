import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';
// ─── Initial Mock Data ────────────────────────────────────
const INITIAL_COMPLAINTS = [];
const INITIAL_BILLS = [];
const INITIAL_CONNECTIONS_MOCK = [];
const getInitialConnections = () => INITIAL_CONNECTIONS_MOCK;
const INITIAL_REQUESTS = [];
const INITIAL_DEPT_ALERTS = {
    electricity: { powerAlerts: [], safetyAlerts: [] },
    water: { supplySchedule: [], qualityReport: [] },
    gas: { safetyAlerts: [], pressureAlerts: [] },
    municipal: { wasteCollection: [], municipalNotices: [] }
};
const INITIAL_KIOSKS = [
    { id: 'K001', location: 'Municipal Office', status: 'online', lastTransaction: '2 mins ago', todayCount: 145, uptime: '99.2%', printer: 'ok', network: 'excellent' }
];
export const ADMIN_CREDENTIALS = {
    'SUPER-ADMIN-000': {
        password: 'admin@123',
        user: { id: 'sa', name: 'Super Admin', email: 'admin@suvidha.gov.in', departmentId: 'SUPER-ADMIN-000', department: 'all', role: 'super_admin', avatar: 'SA' }
    },
    'ELEC-ADMIN-001': {
        password: 'admin@123',
        user: { id: 'elec', name: 'Electricity Admin', email: 'elec@suvidha.gov.in', departmentId: 'ELEC-ADMIN-001', department: 'electricity', role: 'dept_admin', avatar: 'EA' }
    },
    'WATER-ADMIN-002': {
        password: 'admin@123',
        user: { id: 'water', name: 'Water Admin', email: 'water@suvidha.gov.in', departmentId: 'WATER-ADMIN-002', department: 'water', role: 'dept_admin', avatar: 'WA' }
    },
    'GAS-ADMIN-003': {
        password: 'admin@123',
        user: { id: 'gas', name: 'Gas Admin', email: 'gas@suvidha.gov.in', departmentId: 'GAS-ADMIN-003', department: 'gas', role: 'dept_admin', avatar: 'GA' }
    },
    'MUNI-ADMIN-004': {
        password: 'admin@123',
        user: { id: 'muni', name: 'Municipal Admin', email: 'muni@suvidha.gov.in', departmentId: 'MUNI-ADMIN-004', department: 'municipal', role: 'dept_admin', avatar: 'MA' }
    }
};
export const useAdminStore = create()(persist((set, get) => {
    // Listen for storage events across tabs (native Zustand persist doesn't auto-sync other tabs without this)
    if (typeof window !== 'undefined') {
        window.addEventListener('storage', (e) => {
            if (e.key === 'suvidha_admin_state' && e.newValue) {
                try {
                    const state = JSON.parse(e.newValue).state;
                    set(state);
                }
                catch (err) { }
            }
            else if (e.key === 'suvidha_connections' && e.newValue) {
                try {
                    set({ connections: JSON.parse(e.newValue) });
                }
                catch (err) { }
            }
        });
    }
    return {
        adminUser: null,
        complaints: INITIAL_COMPLAINTS,
        bills: INITIAL_BILLS,
        connections: getInitialConnections(),
        requests: INITIAL_REQUESTS,
        deptAlerts: INITIAL_DEPT_ALERTS,
        kiosks: INITIAL_KIOSKS,
        activeDept: 'all',
        isLoggedIn: false,
        fetchAllData: async () => {
            try {
                const [comp, conn, bills, reqs] = await Promise.all([
                    axios.get('/api/admin/complaints'),
                    axios.get('/api/admin/connections'),
                    axios.get('/api/admin/bills'),
                    axios.get('/api/admin/requests')
                ]);
                set({
                    complaints: comp.data.data || [],
                    connections: conn.data.data || [],
                    bills: bills.data.data || [],
                    requests: reqs.data.data || []
                });
            } catch (err) {
                console.error("Failed to fetch admin data", err);
            }
        },
        loginAdmin: (deptId, password) => {
            const cred = ADMIN_CREDENTIALS[deptId];
            if (cred && cred.password === password) {
                set({ adminUser: cred.user, isLoggedIn: true, activeDept: cred.user.department });
                localStorage.setItem('suvidha_dept_alerts', JSON.stringify(get().deptAlerts));
                get().fetchAllData();
                return true;
            }
            return false;
        },
        logoutAdmin: () => set({ adminUser: null, isLoggedIn: false }),
        setActiveDept: (dept) => set({ activeDept: dept }),
        updateComplaintStatus: async (id, status, adminNotes, citizenMessage, by) => {
            set((state) => {
                const updated = state.complaints.map(c => {
                    if (c.id !== id)
                        return c;
                    const newHistory = {
                        status, timestamp: new Date().toISOString(), note: adminNotes || `Status updated to ${status}`, by
                    };
                    return { ...c, status, adminNotes, citizenUpdateMessage: citizenMessage, updatedAt: new Date().toISOString(), statusHistory: [...c.statusHistory, newHistory] };
                });
                localStorage.setItem('suvidha_complaints', JSON.stringify(updated));
                return { complaints: updated };
            });
            try { await axios.put(`/api/admin/complaints/${id}`, { status, adminNotes, citizenMessage, by }); } catch (e) { console.error(e); }
        },
        bulkUpdateComplaintStatus: (ids, status, by) => {
            set((state) => {
                const updated = state.complaints.map(c => {
                    if (!ids.includes(c.id))
                        return c;
                    const newHistory = {
                        status,
                        timestamp: new Date().toISOString(),
                        note: `Bulk status update to ${status}`,
                        by,
                    };
                    return {
                        ...c,
                        status,
                        updatedAt: new Date().toISOString(),
                        statusHistory: [...c.statusHistory, newHistory],
                    };
                });
                localStorage.setItem('suvidha_complaints', JSON.stringify(updated));
                return { complaints: updated };
            });
        },
        bulkAssignComplaints: (ids, assignedTo, by) => {
            set((state) => {
                const updated = state.complaints.map(c => {
                    if (!ids.includes(c.id))
                        return c;
                    const newHistory = {
                        status: c.status,
                        timestamp: new Date().toISOString(),
                        note: `Bulk assigned to ${assignedTo}`,
                        by,
                    };
                    return {
                        ...c,
                        assignedTo,
                        updatedAt: new Date().toISOString(),
                        statusHistory: [...c.statusHistory, newHistory],
                    };
                });
                localStorage.setItem('suvidha_complaints', JSON.stringify(updated));
                return { complaints: updated };
            });
        },
        addComplaintNote: (id, note) => {
            set((state) => ({
                complaints: state.complaints.map(c => c.id === id ? { ...c, adminNotes: note } : c)
            }));
        },
        sendBillAlert: (id, message) => {
            set((state) => {
                const updated = state.bills.map(b => b.id !== id ? b : {
                    ...b, alertSent: true, alertMessage: message, alertSentAt: new Date().toISOString()
                });
                localStorage.setItem('suvidha_bills_alerts', JSON.stringify(updated.filter(b => b.alertSent)));
                return { bills: updated };
            });
        },
        markBillPaid: (id) => {
            set((state) => ({
                bills: state.bills.map(b => b.id !== id ? b : { ...b, status: 'paid' })
            }));
        },
        updateConnectionStatus: async (id, status, notes, rejectionReason = '') => {
            set((state) => {
                const updated = state.connections.map(c => {
                    if (c.id !== id)
                        return c;
                    const newHistory = {
                        status, timestamp: new Date().toISOString(), note: notes || `Status: ${status}`, by: state.adminUser?.name || 'Admin'
                    };
                    return { ...c, status, adminNotes: notes, rejectionReason, statusHistory: [...c.statusHistory, newHistory] };
                });
                localStorage.setItem('suvidha_connections', JSON.stringify(updated));
                return { connections: updated };
            });
            try { await axios.put(`/api/admin/connections/${id}`, { status, notes, rejectionReason }); } catch (e) { console.error(e); }
        },
        updateRequestStatus: async (id, status, assignedTo, notes, scheduledDate) => {
            set((state) => ({
                requests: state.requests.map(r => {
                    if (r.id !== id)
                        return r;
                    const newHistory = {
                        status, timestamp: new Date().toISOString(), note: notes || `Status: ${status}`, by: state.adminUser?.name || 'Admin'
                    };
                    return { ...r, status, assignedTo, adminNotes: notes, scheduledDate, statusHistory: [...r.statusHistory, newHistory] };
                })
            }));
            try { await axios.put(`/api/admin/requests/${id}`, { status, assignedTo, notes, scheduledDate }); } catch (e) { console.error(e); }
        },
        saveDeptAlert: (dept, alertCategory, alertId, updates) => {
            set((state) => {
                const deptAlerts = { ...state.deptAlerts };
                const newDept = { ...deptAlerts[dept] };
                const category = newDept[alertCategory] || [];
                newDept[alertCategory] = category.map(a => a.id === alertId ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a);
                deptAlerts[dept] = newDept;
                localStorage.setItem('suvidha_dept_alerts', JSON.stringify(deptAlerts));
                return { deptAlerts };
            });
        },
        addDeptAlert: (dept, alertCategory, alert) => {
            set((state) => {
                const deptAlerts = { ...state.deptAlerts };
                const newDept = { ...deptAlerts[dept] };
                const category = newDept[alertCategory] || [];
                newDept[alertCategory] = [...category, alert];
                deptAlerts[dept] = newDept;
                localStorage.setItem('suvidha_dept_alerts', JSON.stringify(deptAlerts));
                return { deptAlerts };
            });
        },
        deleteDeptAlert: (dept, alertCategory, alertId) => {
            set((state) => {
                const deptAlerts = { ...state.deptAlerts };
                const newDept = { ...deptAlerts[dept] };
                const category = newDept[alertCategory] || [];
                newDept[alertCategory] = category.filter(a => a.id !== alertId);
                deptAlerts[dept] = newDept;
                localStorage.setItem('suvidha_dept_alerts', JSON.stringify(deptAlerts));
                return { deptAlerts };
            });
        },
        markAsChecked: (type, id) => {
            set((state) => {
                let newState = {};
                if (type === 'complaint') {
                    const updated = state.complaints.map(c => c.id === id ? { ...c, checked: true } : c);
                    localStorage.setItem('suvidha_complaints', JSON.stringify(updated));
                    newState = { complaints: updated };
                }
                else if (type === 'bill') {
                    const updated = state.bills.map(b => b.id === id ? { ...b, checked: true } : b);
                    localStorage.setItem('suvidha_bills', JSON.stringify(updated));
                    newState = { bills: updated };
                }
                else if (type === 'connection') {
                    const updated = state.connections.map(c => c.id === id ? { ...c, checked: true } : c);
                    localStorage.setItem('suvidha_connections', JSON.stringify(updated));
                    newState = { connections: updated };
                }
                else if (type === 'request') {
                    const updated = state.requests.map(r => r.id === id ? { ...r, checked: true } : r);
                    localStorage.setItem('suvidha_requests', JSON.stringify(updated));
                    newState = { requests: updated };
                }
                return newState;
            });
        },
        markAllAsChecked: () => {
            set((state) => {
                const dept = state.adminUser?.department || 'all';
                const match = (item) => dept === 'all' || item.serviceType === dept;
                const complaints = state.complaints.map(c => match(c) ? { ...c, checked: true } : c);
                const bills = state.bills.map(b => match(b) ? { ...b, checked: true } : b);
                const connections = state.connections.map(c => match(c) ? { ...c, checked: true } : c);
                const requests = state.requests.map(r => match(r) ? { ...r, checked: true } : r);
                localStorage.setItem('suvidha_complaints', JSON.stringify(complaints));
                localStorage.setItem('suvidha_bills', JSON.stringify(bills));
                localStorage.setItem('suvidha_connections', JSON.stringify(connections));
                localStorage.setItem('suvidha_requests', JSON.stringify(requests));
                return { complaints, bills, connections, requests };
            });
        },
    };
}, {
    name: 'suvidha_admin_state',
    storage: createJSONStorage(() => localStorage),
    version: 1,
    migrate: (persistedState) => {
        if (!persistedState || typeof persistedState !== 'object')
            return persistedState;
        if (Array.isArray(persistedState.complaints)) {
            persistedState.complaints = persistedState.complaints.map((complaint) => ({
                ...complaint,
                assignedTo: '',
            }));
        }
        return persistedState;
    },
    partialize: (state) => ({
        connections: state.connections,
        complaints: state.complaints,
        bills: state.bills,
        requests: state.requests,
        deptAlerts: state.deptAlerts,
        kiosks: state.kiosks
    })
}));
