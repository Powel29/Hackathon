import { create } from 'zustand';

export const useKioskStore = create((set) => ({
    language: 'en',
    selectedService: null,
    user: null,
    isAuthenticated: false,
    registrationData: null,
    bills: [
        {
            id: '1',
            billNumber: 'ELEC-2026-001',
            amount: 2450,
            dueDate: '2026-02-10',
            status: 'pending',
            serviceType: 'electricity',
            consumerNumber: 'EC123456789',
            billingPeriod: 'January 2026'
        },
        {
            id: '2',
            billNumber: 'ELEC-2025-012',
            amount: 2100,
            dueDate: '2026-01-10',
            status: 'paid',
            serviceType: 'electricity',
            consumerNumber: 'EC123456789',
            billingPeriod: 'December 2025'
        },
        {
            id: '3',
            billNumber: 'WATER-2026-001',
            amount: 850,
            dueDate: '2026-01-25',
            status: 'overdue',
            serviceType: 'water',
            consumerNumber: 'WC987654321',
            billingPeriod: 'January 2026'
        }
    ],
    complaints: [
        {
            id: '1',
            complaintId: 'CMP-2026-12345',
            serviceType: 'electricity',
            description: 'Frequent power cuts in the area',
            status: 'in_progress',
            createdAt: '2026-01-28T10:30:00',
            updatedAt: '2026-01-29T14:20:00',
            technician: {
                name: 'Rajesh Kumar',
                phone: '+91 98765 43210'
            },
            timeline: [
                {
                    status: 'open',
                    timestamp: '2026-01-28T10:30:00',
                    note: 'Complaint registered'
                },
                {
                    status: 'in_progress',
                    timestamp: '2026-01-29T14:20:00',
                    note: 'Technician assigned, inspection scheduled'
                }
            ]
        }
    ],
    showSessionWarning: false,

    setLanguage: (language) => set({ language }),
    setSelectedService: (service) => set({ selectedService: service }),
    setUser: (user) => set({ user, isAuthenticated: true }),
    setIsAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),
    setRegistrationData: (data) => set({ registrationData: data }),
    addBill: (bill) => set((state) => ({ bills: [...state.bills, bill] })),
    updateBill: (id, updates) => set((state) => ({
        bills: state.bills.map(b => b.id === id ? { ...b, ...updates } : b)
    })),
    addComplaint: (complaint) => set((state) => ({ complaints: [...state.complaints, complaint] })),
    updateComplaint: (id, updates) => set((state) => ({
        complaints: state.complaints.map(c => c.id === id ? { ...c, ...updates } : c)
    })),
    setShowSessionWarning: (show) => set({ showSessionWarning: show }),
    resetSession: () => set({
        user: null,
        isAuthenticated: false,
        selectedService: null,
        showSessionWarning: false
    })
}));
