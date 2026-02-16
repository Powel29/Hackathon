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
            // Use kioskDb mock for consistency with login in development
            // Generate demo OTP and store it in localStorage so verifyOTP can validate it
            const key = aadharNumber || mobileNumber;
            const demoOTP = String(Math.floor(100000 + Math.random() * 900000));

            const otpStore = JSON.parse(localStorage.getItem('kiosk_demo_otps') || '{}');
            otpStore[key] = {
                otp: demoOTP,
                createdAt: Date.now()
            };
            localStorage.setItem('kiosk_demo_otps', JSON.stringify(otpStore));

            // Try to find user for masked mobile
            const data = kioskDb.getData();
            const user = data.users.find(u => u.aadhaarNumber === aadharNumber || u.mobile === mobileNumber);
            const maskedMobile = user && user.mobile ? '******' + user.mobile.slice(-4) : undefined;

            return {
                success: true,
                maskedMobile,
                // Expose demo OTP only for development convenience
                _demoOTP: demoOTP
            };
        } catch (error) {
            console.error("❌ Mock sendOTP error:", error);
            const err = new Error('Failed to send OTP');
            throw err;
        }
    },
    verifyOTP: async (aadharNumber, otp, userData = null) => {
        try {
            // Validate against stored demo OTPs
            const key = aadharNumber || (userData && userData.mobileNumber) || '';
            const otpStore = JSON.parse(localStorage.getItem('kiosk_demo_otps') || '{}');
            const record = otpStore[key];

            if (!record || record.otp !== String(otp)) {
                const err = new Error('Invalid OTP');
                err.code = 'INVALID_OTP';
                throw err;
            }

            // OTP matched - find or create user
            let data = kioskDb.getData();
            let user = data.users.find(u => u.aadhaarNumber === aadharNumber || u.mobile === (userData?.mobileNumber || ''));

            if (!user && userData) {
                // Create a new user via kioskDb.registerUser
                const newUserPayload = {
                    aadhaarNumber: userData.aadhaarNumber || aadharNumber,
                    name: userData.fullName || userData.name || 'New User',
                    mobile: userData.mobileNumber || '',
                    email: userData.email || '' ,
                    consumerId: userData.consumerId || '',
                    serviceType: userData.serviceType || 'electricity'
                };
                try {
                    user = kioskDb.registerUser(newUserPayload);
                } catch (regErr) {
                    console.error('User registration in mock DB failed', regErr);
                }
            }

            if (!user) {
                const err = new Error('User not found');
                err.code = 'USER_NOT_FOUND';
                throw err;
            }
            // generate a mock token and persist
            const token = 'mock-jwt-token-' + (user ? user.id : 'anonymous');
            localStorage.setItem('token', token);
            if (user) localStorage.setItem('user', JSON.stringify(user));

            // Clean up used OTP
            delete otpStore[key];
            localStorage.setItem('kiosk_demo_otps', JSON.stringify(otpStore));

            return {
                success: true,
                token,
                user
            };
        } catch (error) {
            console.error("❌ Mock verifyOTP error:", error);
            const err = new Error(error.message || 'OTP verification failed');
            err.code = error.code || 'OTP_VERIFY_ERROR';
            throw err;
        }
    }
};

// Bill Service
export const billService = {
    getUserBills: async (filters = {}) => {
        try {
            console.log('🔍 Getting user bills...', filters);
            const response = await api.get('/bills', { params: filters });
            console.log('✅ User Bills Response:', response.data);
            return response.data.bills || [];
        } catch (error) {
            console.error('❌ API getUserBills error:', error);
            throw error;
        }
    },
    getBillByNumber: async (billNumber) => {
        try {
            console.log(`🔍 Getting bill by number: ${billNumber}`);
            const response = await api.get(`/bills/${billNumber}`);
            console.log('✅ Bill Response:', response.data);
            return response.data.bill;
        } catch (error) {
            console.error('❌ API getBillByNumber error:', error);
            throw error;
        }
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

// Complaint Service
export const complaintService = {
    submit: async (complaintData) => {
        try {
            console.log('🔍 Submitting complaint:', complaintData);
            // Construct payload matching backend expectation
            const payload = {
                serviceType: complaintData.serviceType,
                complaintType: complaintData.complaintType,
                title: complaintData.title,
                description: complaintData.description,
                // Add other fields if needed
            };
            const response = await api.post('/complaints', payload);
            console.log('✅ Submit Complaint Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ API submitComplaint error:', error);
            throw error;
        }
    },
    track: async (id) => {
        try {
            console.log(`🔍 Tracking complaint: ${id}`);
            const response = await api.get(`/complaints/track/${id}`);
            console.log('✅ Track Complaint Response:', response.data);
            return response.data.complaint;
        } catch (error) {
            console.error('❌ API trackComplaint error:', error);
            throw error;
        }
    },
    getUserComplaints: async (filters = {}) => {
        try {
            console.log('🔍 Getting user complaints...', filters);
            const response = await api.get('/complaints', { params: filters });
            console.log('✅ User Complaints Response:', response.data);
            return response.data.complaints || [];
        } catch (error) {
            console.error('❌ API getUserComplaints error:', error);
            throw error;
        }
    }
};

// Connection Service
export const connectionService = {
    requestNew: async (connectionData) => {
        try {
            console.log('🔍 Requesting new connection:', connectionData);
            const response = await api.post('/connections/new', connectionData);
            console.log('✅ New Connection Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ API requestNewConnection error:', error);
            throw error;
        }
    },
    track: async (id) => {
        try {
            console.log(`🔍 Tracking connection application: ${id}`);
            const response = await api.get(`/connections/track/${id}`);
            console.log('✅ Track Connection Response:', response.data);
            return response.data.application;
        } catch (error) {
            console.error('❌ API trackConnection error:', error);
            throw error;
        }
    },
    getMyApplications: async (filters = {}) => {
        try {
            console.log('🔍 Getting user connection applications...', filters);
            const response = await api.get('/connections', { params: filters });
            console.log('✅ User Applications Response:', response.data);
            return response.data.applications || [];
        } catch (error) {
            console.error('❌ API getMyApplications error:', error);
            throw error;
        }
    }
};

// Department Service
export const departmentService = {
    verifyAccount: async (serviceType, consumerNumber) => {
        try {
            console.log('🔍 Verifying department account:', { serviceType, consumerNumber });
            const response = await api.post('/departments/verify', {
                serviceType: serviceType.toUpperCase(),
                consumerNumber
            });
            console.log('✅ Verification Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ API verifyAccount error:', error);
            console.error('❌ Error response:', error.response?.data);
            const err = new Error(error.response?.data?.error?.message || 'Failed to verify account');
            err.code = error.response?.data?.error?.code;
            throw err;
        }
    },
    getAccountDetails: async (serviceType, consumerNumber) => {
        try {
            console.log('🔍 Getting account details:', { serviceType, consumerNumber });
            const response = await api.get(`/departments/${serviceType.toUpperCase()}/${consumerNumber}`);
            console.log('✅ Account Details Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ API getAccountDetails error:', error);
            console.error('❌ Error response:', error.response?.data);
            const err = new Error(error.response?.data?.error?.message || 'Failed to get account details');
            err.code = error.response?.data?.error?.code;
            throw err;
        }
    }
};

export default api;
