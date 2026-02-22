import { create } from 'zustand';
import { kioskDb } from '../services/kioskDb';

// Initialize DB
kioskDb.init();

export const useKioskStore = create((set) => ({
    language: 'en',
    selectedService: null,
    user: null,
    isAuthenticated: false,
    registrationData: null,

    // Load initial data from local DB
    bills: [],
    complaints: [],

    showSessionWarning: false,

    setLanguage: (language) => set({ language }),
    setSelectedService: (service) => set({ selectedService: service }),

    setUser: (user) => {
        const bills = kioskDb.getBills(user?.consumerId);
        const complaints = kioskDb.getComplaints(user?.consumerId);
        set({ user, isAuthenticated: true, bills, complaints });
    },

    setIsAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),
    setRegistrationData: (data) => set({ registrationData: data }),

    addBill: (bill) => set((state) => ({ bills: [...state.bills, bill] })),

    // Update local state AND persist to DB
    updateBill: async (id, updates) => {
        // If it's a payment, persist first
        if (updates.status === 'paid') {
            try {
                await kioskDb.payBill(id);
            } catch (e) {
                console.error("Failed to pay bill in DB", e);
                return; // Do not update local state if DB fails
            }
            set((state) => ({
                bills: state.bills.map(b => b.id === id ? { ...b, ...updates } : b)
            }));
        } else {
            // For non-payment updates, update local state as before
            set((state) => ({
                bills: state.bills.map(b => b.id === id ? { ...b, ...updates } : b)
            }));
        }
    },

    addComplaint: (complaint) => {
        const newComplaint = kioskDb.addComplaint(complaint);
        set((state) => ({ complaints: [...state.complaints, newComplaint] }));
    },

    updateComplaint: (id, updates) => set((state) => ({
        complaints: state.complaints.map(c => c.id === id ? { ...c, ...updates } : c)
    })),

    setShowSessionWarning: (show) => set({ showSessionWarning: show }),

    resetSession: () => set({
        user: null,
        isAuthenticated: false,
        selectedService: null,
        showSessionWarning: false,
        bills: [],
        complaints: []
    })
}));
