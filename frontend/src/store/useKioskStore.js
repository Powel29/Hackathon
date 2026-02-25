import { create } from 'zustand';
import { billService } from '../services/api/bills.service';
import { complaintService } from '../services/api/complaints.service';

export const useKioskStore = create((set, get) => ({
    language: 'en',
    selectedService: null,
    user: null,
    isAuthenticated: false,
    registrationData: null,

    // Live data from API
    bills: [],
    complaints: [],
    applications: [],
    serviceRequests: [],
    loading: false,

    showSessionWarning: false,

    setLanguage: (language) => set({ language }),
    setSelectedService: (service) => set({ selectedService: service }),
    setBills: (bills) => set({ bills }),
    setApplications: (applications) => set({ applications }),
    setServiceRequests: (serviceRequests) => set({ serviceRequests }),

    setUser: (user) => {
        set({ user, isAuthenticated: !!user });
        if (user) {
            get().fetchBills();
            get().fetchComplaints();
            get().fetchApplications();
            get().fetchServiceRequests();
        }
    },

    fetchBills: async () => {
        const { user } = get();
        if (!user) return;
        try {
            set({ loading: true });
            const bills = await billService.getBills();
            set({ bills, loading: false });
        } catch (error) {
            console.error('Failed to fetch bills:', error);
            set({ loading: false });
        }
    },

    fetchComplaints: async () => {
        const { user } = get();
        if (!user) return;
        try {
            set({ loading: true });
            const complaints = await complaintService.getUserComplaints();
            set({ complaints, loading: false });
        } catch (error) {
            console.error('Failed to fetch complaints:', error);
            set({ loading: false });
        }
    },

    fetchApplications: async () => {
        const { user } = get();
        if (!user) return;
        try {
            set({ loading: true });
            const { connectionService } = await import('../services/api');
            const applications = await connectionService.getMyApplications();
            set({ applications, loading: false });
        } catch (error) {
            console.error('Failed to fetch applications:', error);
            set({ loading: false });
        }
    },

    fetchServiceRequests: async () => {
        const { user } = get();
        if (!user) return;
        try {
            set({ loading: true });
            const { serviceRequestService } = await import('../services/api/serviceRequest.service');
            const data = await serviceRequestService.getAll();
            set({ serviceRequests: data.requests || [], loading: false });
        } catch (error) {
            console.error('Failed to fetch service requests:', error);
            set({ loading: false });
        }
    },

    setIsAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),
    setRegistrationData: (data) => set({ registrationData: data }),

    addBill: (bill) => set((state) => ({ bills: [...state.bills, bill] })),

    // Update local state AND persist to DB
    updateBill: async (id, updates, skipPersistence = false) => {
        // If it's a payment, persist first (unless skipping for offline support)
        if (updates.status === 'paid' && !skipPersistence) {
            try {
                const bill = get().bills.find(b => b.id === id);
                await billService.processPayment({
                    billId: id,
                    serviceType: bill?.type || bill?.serviceType,
                    ...updates
                });
            } catch (e) {
                console.error("Failed to pay bill in DB", e);
                return; // Do not update local state if DB fails
            }
        }

        set((state) => ({
            bills: state.bills.map(b => b.id === id ? { ...b, ...updates } : b)
        }));
    },

    addComplaint: async (complaint) => {
        try {
            const response = await complaintService.submit(complaint);
            if (response.success) {
                // Refresh list to get real ID and formatted complaint number from backend
                await get().fetchComplaints();
            }
        } catch (error) {
            console.error('Failed to add complaint:', error);
            throw error;
        }
    },

    updateComplaint: (id, updates) => set((state) => ({
        complaints: state.complaints.map(c => c.id === id ? { ...c, ...updates } : c)
    })),

    setShowSessionWarning: (show) => set({ showSessionWarning: show }),

    resetSession: () => {
        // Wipe auth token from sessionStorage (FR-SEC-001)
        import('../core/security/storagePolicy').then(({ tokenStrategy }) => {
            tokenStrategy.securityWipe();
        });
        // Reset voice state to prevent carry-over between kiosk users.
        import('./useVoiceStore').then(({ useVoiceStore }) => {
            useVoiceStore.getState().reset();
        });
        set({
            user: null,
            isAuthenticated: false,
            selectedService: null,
            showSessionWarning: false,
            bills: [],
            complaints: []
        });
    }
}));

