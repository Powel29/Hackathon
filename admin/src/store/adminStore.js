import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
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
const INITIAL_KIOSKS = [];

export const useAdminStore = create()(persist((set, get) => {
    // Restore JWT from localStorage on page load / hot-reload
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('suvidha_admin_token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }

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
                const [comp, conn, bills, reqs, alerts, kiosks] = await Promise.all([
                    axios.get('/api/admin/complaints'),
                    axios.get('/api/admin/connections'),
                    axios.get('/api/admin/bills'),
                    axios.get('/api/admin/requests'),
                    axios.get('/api/admin/alerts'),
                    axios.get('/api/admin/kiosks')
                ]);

                // Transform DB alerts back to the categorized object the UI expects
                const CategorizedAlerts = JSON.parse(JSON.stringify(INITIAL_DEPT_ALERTS));
                if (alerts.data && alerts.data.data) {
                    alerts.data.data.forEach(a => {
                        const dept = a.serviceType.toLowerCase();
                        const cat = a.alertType || 'municipalNotices'; // fallback
                        if (CategorizedAlerts[dept]) {
                            CategorizedAlerts[dept][cat] = CategorizedAlerts[dept][cat] || [];
                            CategorizedAlerts[dept][cat].push({
                                id: a.alertId,
                                title: a.title,
                                content: a.message,
                                type: a.severity || 'info',
                                active: a.isActive,
                                updatedAt: a.createdAt
                            });
                        }
                    });
                }

                set({
                    complaints: comp.data.data || [],
                    connections: conn.data.data || [],
                    bills: bills.data.data || [],
                    requests: reqs.data.data || [],
                    deptAlerts: CategorizedAlerts,
                    kiosks: kiosks.data.data || []
                });
            } catch (err) {
                console.error("Failed to fetch admin data", err);
            }
        },

        logoutAdmin: () => {
            localStorage.removeItem('suvidha_admin_token');
            delete axios.defaults.headers.common['Authorization'];
            set({ adminUser: null, isLoggedIn: false });
        },
        // Secure login via backend API
        loginAdmin: async (deptId, password) => {
            try {
                const resp = await axios.post('/api/admin/login', { deptId, password });
                if (resp.data && resp.data.success && resp.data.user) {
                    const { user, token } = resp.data;
                    // Attach JWT to all future axios requests
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    localStorage.setItem('suvidha_admin_token', token);
                    set({ adminUser: user, isLoggedIn: true, activeDept: user.department });
                    await get().fetchAllData();
                    return true;
                } else {
                    console.error('Admin login: unexpected response', resp.data);
                }
            } catch (err) {
                const msg = err?.response?.data?.message || err.message;
                console.error('Admin login failed:', msg);
            }
            return false;
        },
        setActiveDept: (dept) => set({ activeDept: dept }),
        searchCitizen: async (query) => {
            try {
                if (!query || !query.trim()) return [];
                const resp = await axios.get(`/api/admin/citizens/search?q=${encodeURIComponent(query)}`);
                if (resp.data && resp.data.success) {
                    return resp.data.data || [];
                }
            } catch (err) {
                console.error("Failed to search citizens", err);
            }
            return [];
        },
        updateComplaintStatus: async (id, status, adminNotes, citizenMessage, by, assignedTo) => {
            set((state) => {
                const updated = state.complaints.map(c => {
                    if (c.id !== id)
                        return c;
                    const newHistory = {
                        status,
                        timestamp: new Date().toISOString(),
                        note: adminNotes || `Status updated to ${status}`,
                        citizenMessage: citizenMessage || '',
                        by
                    };
                    return { ...c, status, adminNotes, citizenUpdateMessage: citizenMessage, assignedTo, updatedAt: new Date().toISOString(), statusHistory: [...c.statusHistory, newHistory] };
                });
                localStorage.setItem('suvidha_complaints', JSON.stringify(updated));
                return { complaints: updated };
            });
            try { await axios.put(`/api/admin/complaints/${id}`, { status, adminNotes, citizenMessage, by, assignedTo }); } catch (e) { console.error(e); }
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
        createBill: async (billData) => {
            try {
                const resp = await axios.post('/api/admin/bills', billData);
                if (resp.data && resp.data.success) {
                    await get().fetchAllData();
                    return true;
                }
            } catch (err) {
                console.error("Failed to create bill", err);
            }
            return false;
        },
        updateBillStatus: async (id, status, serviceType) => {
            try {
                const resp = await axios.put(`/api/admin/bills/${id}`, { status, serviceType });
                if (resp.data.success) {
                    set((state) => ({
                        bills: state.bills.map(b => b.id === id ? { ...b, status } : b)
                    }));
                }
            } catch (err) {
                console.error("Failed to update bill", err);
            }
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
        saveDeptAlert: async (dept, alertCategory, alertId, updates) => {
            // Optimistic UI update
            set((state) => {
                const deptAlerts = { ...state.deptAlerts };
                const newDept = { ...deptAlerts[dept] };
                const category = newDept[alertCategory] || [];
                newDept[alertCategory] = category.map(a => a.id === alertId ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a);
                deptAlerts[dept] = newDept;
                return { deptAlerts };
            });

            try {
                await axios.put(`/api/admin/alerts/${alertId}`, updates);
            } catch (err) {
                console.error("Failed to save alert to backend", err);
                // Refresh data to revert to server state
                await get().fetchAllData();
            }
        },
        addDeptAlert: async (dept, alertCategory, alert) => {
            try {
                const resp = await axios.post('/api/admin/alerts', {
                    ...alert,
                    serviceType: dept,
                    alertType: alertCategory
                });

                if (resp.data && resp.data.success) {
                    const savedAlert = resp.data.data;
                    set((state) => {
                        const deptAlerts = { ...state.deptAlerts };
                        const newDept = { ...deptAlerts[dept] };
                        const category = newDept[alertCategory] || [];
                        newDept[alertCategory] = [...category, {
                            id: savedAlert.alertId,
                            title: savedAlert.title,
                            content: savedAlert.message,
                            type: savedAlert.severity,
                            active: savedAlert.isActive,
                            updatedAt: savedAlert.createdAt
                        }];
                        deptAlerts[dept] = newDept;
                        return { deptAlerts };
                    });
                }
            } catch (err) {
                console.error("Failed to add alert to backend", err);
            }
        },
        deleteDeptAlert: async (dept, alertCategory, alertId) => {
            // Optimistic UI update
            set((state) => {
                const deptAlerts = { ...state.deptAlerts };
                const newDept = { ...deptAlerts[dept] };
                const category = newDept[alertCategory] || [];
                newDept[alertCategory] = category.filter(a => a.id !== alertId);
                deptAlerts[dept] = newDept;
                return { deptAlerts };
            });

            try {
                await axios.delete(`/api/admin/alerts/${alertId}`);
            } catch (err) {
                console.error("Failed to delete alert from backend", err);
                await get().fetchAllData();
            }
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
