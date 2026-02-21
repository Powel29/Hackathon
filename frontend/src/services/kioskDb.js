import { v4 as uuidv4 } from 'uuid';

/**
 * Kiosk Database Service
 * Simulates a backend database using localStorage for offline development.
 */

const DB_KEY = 'suvidha_kiosk_db';

// Initial seed data extracted from initial-data.sql and useKioskStore.js
const INITIAL_DATA = {
    users: [
        {
            id: 'u1',
            aadhaarNumber: '123456789012',
            name: 'Rajesh Kumar',
            mobile: '9876543210',
            email: 'rajesh@example.com',
            consumerId: 'EC123456789', // Simplification for demo
            serviceType: 'electricity'
        },
        {
            id: 'u2',
            aadhaarNumber: '234567890123',
            name: 'Priya Sharma',
            mobile: '9876543230',
            email: 'priya@example.com',
            consumerId: 'GC987654321',
            serviceType: 'gas'
        },
        {
            id: 'u3',
            aadhaarNumber: '345678901234',
            name: 'Amit Patel',
            mobile: '9876543240',
            email: 'amit@example.com',
            consumerId: 'WC987654321',
            serviceType: 'water'
        }
    ],
    bills: [
        {
            id: 'b11b1111-1111-4111-8111-111111111111',
            billNumber: 'ELEC-2026-001',
            amount: 2450,
            dueDate: '2026-02-10',
            status: 'pending',
            serviceType: 'electricity',
            consumerNumber: 'EC123456789',
            billingPeriod: 'January 2026',
            userId: 'u1'
        },
        {
            id: 'b22b2222-2222-4222-8222-222222222222',
            billNumber: 'ELEC-2025-012',
            amount: 2100,
            dueDate: '2026-01-10',
            status: 'paid',
            serviceType: 'electricity',
            consumerNumber: 'EC123456789',
            billingPeriod: 'December 2025',
            userId: 'u1'
        },
        {
            id: 'b33b3333-3333-4333-8333-333333333333',
            billNumber: 'GAS-2026-001',
            amount: 1550,
            dueDate: '2026-02-10',
            status: 'pending',
            serviceType: 'gas',
            consumerNumber: 'GC987654321',
            billingPeriod: 'January 2026',
            userId: 'u2'
        },
        {
            id: 'b44b4444-4444-4444-8444-444444444444',
            billNumber: 'WATER-2026-001',
            amount: 850,
            dueDate: '2026-01-25',
            status: 'overdue',
            serviceType: 'water',
            consumerNumber: 'WC987654321',
            billingPeriod: 'January 2026',
            userId: 'u3'
        },
        {
            id: 'b55b5555-5555-4555-8555-555555555555',
            billNumber: 'PT-2026-1001',
            amount: 4550,
            dueDate: '2026-03-31',
            status: 'pending',
            serviceType: 'municipal',
            consumerNumber: 'MC987654321',
            billingPeriod: '2025-2026',
            userId: 'u1'
        }
    ],
    complaints: [
        {
            id: 'c11c1111-1111-4111-8111-111111111111',
            complaintId: 'CMP-2026-12345',
            serviceType: 'electricity',
            description: 'Frequent power cuts in the area',
            status: 'in_progress',
            createdAt: '2026-01-28T10:30:00',
            updatedAt: '2026-01-29T14:20:00',
            userId: 'u1',
            timeline: [
                {
                    status: 'open',
                    timestamp: '2026-01-28T10:30:00',
                    note: 'Complaint registered'
                },
                {
                    status: 'in_progress',
                    timestamp: '2026-01-29T14:20:00',
                    note: 'Technician assigned'
                }
            ]
        }
    ]
};

class KioskDbService {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem(DB_KEY)) {
            console.log('Initializing Kiosk DB with seed data...');
            localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DATA));
        }
    }

    getData() {
        const raw = localStorage.getItem(DB_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            // Auto migrate old non-UUID data
            if (parsed.bills?.[0]?.id === '1') {
                console.log('Migrating old kiosk data to UUIDs...');
                localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DATA));
                return INITIAL_DATA;
            }
            return parsed;
        }
        return JSON.parse(JSON.stringify(INITIAL_DATA));
    }

    saveData(data) {
        localStorage.setItem(DB_KEY, JSON.stringify(data));
    }

    // --- User Methods ---
    login(consumerId, mobile) {
        const data = this.getData();
        const user = data.users.find(u =>
            u.consumerId === consumerId || u.mobile === mobile
        );
        return user || null;
    }

    registerUser(userData) {
        const data = this.getData();
        // Check if exists
        if (data.users.find(u => u.consumerId === userData.consumerId)) {
            throw new Error('User already exists');
        }

        const newUser = {
            id: uuidv4(),
            ...userData
        };
        data.users.push(newUser);
        this.saveData(data);
        return newUser;
    }

    // --- Bill Methods ---
    getBills(consumerId) {
        const data = this.getData();
        return data.bills.filter(b => b.consumerNumber === consumerId);
    }

    payBill(billId) {
        const data = this.getData();
        const billIndex = data.bills.findIndex(b => b.id === billId);

        if (billIndex === -1) throw new Error('Bill not found');

        const updatedBill = {
            ...data.bills[billIndex],
            status: 'paid',
            paidAt: new Date().toISOString()
        };

        data.bills[billIndex] = updatedBill;
        this.saveData(data);
        return updatedBill;
    }

    // --- Complaint Methods ---
    getComplaints(_consumerId) {
        // In a real app, we'd filter by userId, but here we can filter by matching service type if userId isn't available easily
        const data = this.getData();
        // For simplicity, returning all complaints for now or filtering by user if we had a way to map consumerId to userId easily here
        // Let's assume the store passes the correct filter or we filter by attached user
        return data.complaints;
    }

    addComplaint(complaintData) {
        const data = this.getData();
        const sequence = data.complaints.length + 1;
        const newComplaint = {
            id: uuidv4(),
            complaintId: `CMP-${new Date().getFullYear()}-${String(sequence).padStart(5, '0')}`,
            status: 'open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            timeline: [
                {
                    status: 'open',
                    timestamp: new Date().toISOString(),
                    note: 'Complaint registered'
                }
            ],
            ...complaintData
        };

        data.complaints.push(newComplaint);
        this.saveData(data);
        return newComplaint;
    }
}
export const kioskDb = new KioskDbService();
