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
    loading: false,

    showSessionWarning: false,

    setLanguage: (language) => set({ language }),
    setSelectedService: (service) => set({ selectedService: service }),
    setBills: (bills) => set({ bills }),

    setUser: (user) => {
        set({ user, isAuthenticated: !!user });
        if (user) {
            get().fetchBills();
            get().fetchComplaints();
        }
    },

    fetchBills: async () => {
        const { user } = get();
        if (!user) return;
        try {
            set({ loading: true });
            const bills = await billService.getBills(); // Backend filters by logged-in user typically
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

    setIsAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),
    setRegistrationData: (data) => set({ registrationData: data }),

    addBill: (bill) => set((state) => ({ bills: [...state.bills, bill] })),

    // Update local state AND persist to DB
    updateBill: async (id, updates) => {
        // If it's a payment, persist first
        if (updates.status === 'paid') {
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
            set((state) => ({
                bills: state.bills.map(b => b.id === id ? { ...b, ...updates } : b)
            }));
        } else {
            set((state) => ({
                bills: state.bills.map(b => b.id === id ? { ...b, ...updates } : b)
            }));
        }
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

