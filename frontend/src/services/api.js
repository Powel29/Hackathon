import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

import { kioskDb } from './kioskDb';

// Auth Service
export const authService = {
    login: async (credentials) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const user = kioskDb.login(credentials.consumerId, credentials.mobile);

        if (user) {
            return {
                success: true,
                token: 'mock-jwt-token-' + user.id,
                user: user
            };
        } else {
            throw new Error('Invalid credentials');
        }
    },
    sendOTP: async (aadharNumber, mobileNumber) => {
        try {
            console.log('🔍 API URL:', API_URL);
            console.log('🔍 Sending OTP request:', { aadharNumber, mobileNumber });

            // Only include mobileNumber if it's provided (not empty)
            const payload = { aadharNumber };
            if (mobileNumber && mobileNumber.trim()) {
                payload.mobileNumber = mobileNumber;
            }

            const response = await api.post('/auth/initiate', payload);
            console.log('✅ OTP Response:', response.data);
            return response.data;
        } catch (error) {
            console.error("❌ API sendOTP error:", error);
            console.error("❌ Error response:", error.response?.data);
            const err = new Error(error.response?.data?.error?.message || 'Failed to send OTP');
            err.code = error.response?.data?.error?.code;
            throw err;
        }
    },
    verifyOTP: async (aadharNumber, otp, userData = null) => {
        try {
            console.log('🔍 Verifying OTP:', { aadharNumber, otp, hasUserData: !!userData });
            const response = await api.post('/auth/verify-otp', {
                aadharNumber,
                otp,
                userData // Optional: Only for registration
            });
            console.log('✅ Verify Response:', response.data);
            return response.data;
        } catch (error) {
            console.error("❌ API verifyOTP error:", error);
            console.error("❌ Error response:", error.response?.data);
            const err = new Error(error.response?.data?.error?.message || 'OTP verification failed');
            err.code = error.response?.data?.error?.code;
            throw err;
        }
    }
};

// Bill Service (Mock)
export const billService = {
    getUserBills: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        // We need the current user to get their bills. 
        // In a real app, the token auth handles this.
        // Here we'll grab from localStorage or kioskDb if we had current user stored there too
        const userStr = localStorage.getItem('user');
        if (!userStr) return [];
        const user = JSON.parse(userStr);
        return kioskDb.getBills(user.consumerId);
    },
    getBillByNumber: async (_billNumber) => {
        // Not implemented in simple kioskDb yet, but could filter
        return null;
    }
};

// Payment Service (Mock)
export const paymentService = {
    createOrder: async (orderData) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            id: 'order_' + Math.random().toString(36).substr(2, 9),
            amount: orderData.amount,
            currency: 'INR'
        };
    },
    verifyPayment: async (_paymentData) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true };
    }
};

// Complaint Service (Mock)
export const complaintService = {
    submit: async (complaintData) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const newComplaint = kioskDb.addComplaint(complaintData);
        return { success: true, complaint: newComplaint };
    },
    track: async (_id) => {
        // Not impl
        return null;
    },
    getUserComplaints: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        const userStr = localStorage.getItem('user');
        if (!userStr) return [];
        const user = JSON.parse(userStr);
        return kioskDb.getComplaints(user.consumerId);
    }
};

// Connection Service (Mock)
export const connectionService = {
    requestNew: async (_connectionData) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true, message: 'Request submitted' };
    },
    track: async (_id) => {
        return null;
    }
};

export default api;
