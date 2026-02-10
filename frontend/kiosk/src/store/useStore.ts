import { create } from 'zustand';

export type ServiceType = 'electricity' | 'gas' | 'water' | 'municipal';

interface User {
  name: string;
  aadhaarNumber: string;
  consumerId: string;
  phoneNumber: string;
  email: string;
}

interface RegistrationData {
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: string;
  gender: string;
  fatherName: string;
  motherName: string;
  aadhaarNumber: string;
  panNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  occupation: string;
  loginField1: string;
  loginField2: string;
}

interface Bill {
  id: string;
  billNumber: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  serviceType: ServiceType;
  consumerNumber: string;
  billingPeriod: string;
}

interface Complaint {
  id: string;
  complaintId: string;
  serviceType: ServiceType;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  technician?: {
    name: string;
    phone: string;
  };
  timeline: {
    status: string;
    timestamp: string;
    note: string;
  }[];
}

interface StoreState {
  language: string;
  selectedService: ServiceType | null;
  user: User | null;
  isAuthenticated: boolean;
  registrationData: RegistrationData | null;
  bills: Bill[];
  complaints: Complaint[];
  showSessionWarning: boolean;
  
  setLanguage: (language: string) => void;
  setSelectedService: (service: ServiceType) => void;
  setUser: (user: User) => void;
  setIsAuthenticated: (isAuth: boolean) => void;
  setRegistrationData: (data: RegistrationData) => void;
  addBill: (bill: Bill) => void;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  addComplaint: (complaint: Complaint) => void;
  updateComplaint: (id: string, updates: Partial<Complaint>) => void;
  setShowSessionWarning: (show: boolean) => void;
  resetSession: () => void;
}

export const useStore = create<StoreState>((set) => ({
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