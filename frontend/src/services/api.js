import axios from 'axios';
import { tokenStrategy } from '../core/security/storagePolicy';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests — reads from sessionStorage (FR-SEC-001)
api.interceptors.request.use((config) => {
    const token = tokenStrategy.getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 - clear session and redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const currentPath = window.location.pathname;
            // Only redirect if not already on login page to avoid redirect loops
            if (!currentPath.includes('/login') && !currentPath.includes('/auth')) {
                console.warn('Session expired or invalid. Redirecting to login...');
                tokenStrategy.securityWipe();
                window.location.href = '/kiosk/login-register';
            }
        }
        return Promise.reject(error);
    }
);

// Auth Service
export const authService = {
    login: async (credentials) => {
        // Fallback for any UI components still trying a direct pure login
        console.warn("Direct login used instead of OTP flow. Forwarding to Auth Initiate.");
        return authService.sendOTP(credentials.consumerId || credentials.aadharNumber, credentials.mobile);
    },
    sendOTP: async (aadharNumber, mobileNumber) => {
        try {
            console.log('🔍 Initiating Auth (OTP Send):', { aadharNumber });
            const response = await api.post('/auth/initiate', {
                aadharNumber,
                mobileNumber
            });
            console.log('✅ Auth Initiate Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ API sendOTP error:', error);
            if (error.response && error.response.data && error.response.data.error) {
                const err = new Error(error.response.data.error.message);
                err.code = error.response.data.error.code;
                throw err;
            }
            throw new Error('Failed to send OTP. Please try again later.');
        }
    },
    verifyOTP: async (aadharNumber, otp, userData = null) => {
        try {
            console.log('🔍 Verifying OTP for:', aadharNumber);

            const payload = { aadharNumber, otp };

            // If new user registration, include userData details
            if (userData) {
                payload.userData = userData;
                if (userData.mobileNumber) {
                    payload.mobileNumber = userData.mobileNumber;
                }
            }

            const response = await api.post('/auth/verify-otp', payload);
            console.log('✅ OTP Verify Response:', response.data);

            if (response.data.success && response.data.token) {
                tokenStrategy.setToken(response.data.token);
                if (response.data.user) {
                    tokenStrategy.setUser(response.data.user);
                }
            }

            return response.data;
        } catch (error) {
            console.error('❌ API verifyOTP error:', error);
            if (error.response && error.response.data && error.response.data.error) {
                const err = new Error(error.response.data.error.message);
                err.code = error.response.data.error.code;
                throw err;
            }
            throw new Error('OTP verification failed');
        }
    },
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error (ignoring):', error);
        } finally {
            tokenStrategy.securityWipe();
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
            const bills = response.data.bills || [];

            return bills;
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
    createOrder: async ({ amount, billId, billType }) => {
        const response = await api.post('/payment/create-order', {
            amount,
            billId,
            billType,
        });
        return response.data;
    },
    verifyPayment: async (paymentData) => {
        const response = await api.post('/payment/verify-payment', paymentData);
        return response.data;
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

// Document Service
export const documentService = {
    uploadDocument: async (file, documentData) => {
        try {
            console.log('🔍 Uploading document:', file.name);
            const formData = new FormData();
            formData.append('file', file);

            // Append all metadata fields
            Object.keys(documentData).forEach(key => {
                if (documentData[key]) {
                    formData.append(key, documentData[key]);
                }
            });

            // Need to set multipart content type
            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('✅ Document Upload Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ API uploadDocument error:', error);
            throw error;
        }
    },
    getRelatedDocuments: async (relatedId) => {
        try {
            console.log('🔍 Fetching related documents for ID:', relatedId);
            const response = await api.get(`/documents/related/${relatedId}`);
            console.log('✅ Fetched Documents:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ API getRelatedDocuments error:', error);
            throw error;
        }
    },
    getUserDocuments: async (citizenId, department) => {
        try {
            console.log('🔍 Fetching all documents for citizen:', citizenId, ' in department:', department);
            const response = await api.get(`/documents/citizen/${citizenId}`, {
                params: { department }
            });
            console.log('✅ Fetched Citizen Documents:', response.data);
            return response.data.documents || [];
        } catch (error) {
            console.error('❌ API getUserDocuments error:', error);
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
            // If account not available (404), return formatted result instead of throwing
            if (error.response && error.response.status === 404) {
                console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ff9800; font-weight: bold');
                console.log('%c⚠️  ACCOUNT NOT AVAILABLE', 'color: #ff9800; font-weight: bold; font-size: 12px');
                console.table({
                    Status: 'NOT_FOUND',
                    Department: serviceType,
                    ConsumerID: consumerNumber,
                    Message: error.response?.data?.error?.message || 'Account not found in system'
                });
                console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #ff9800; font-weight: bold');

                return {
                    success: false,
                    notFound: true,
                    error: {
                        message: error.response?.data?.error?.message || 'Account not found',
                        code: 'NOT_FOUND'
                    }
                };
            }

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
    },
    requestApproval: async (serviceType, consumerNumber) => {
        try {
            const response = await api.post('/departments/request-approval', {
                serviceType: serviceType.toUpperCase(),
                consumerNumber
            });
            return response.data;
        } catch (error) {
            const err = new Error(error.response?.data?.message || 'Failed to submit approval request');
            throw err;
        }
    },
    getAlerts: async (serviceType) => {
        try {
            console.log('🔍 Fetching alerts for:', serviceType);
            const response = await api.get(`/departments/${serviceType.toUpperCase()}/alerts`);
            console.log('✅ Alerts Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ API getAlerts error:', error);
            throw error;
        }
    }
};

// Service Request Service
export const serviceRequestService = {
    create: async (data) => {
        const response = await api.post('/service-requests', data);
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/service-requests/${id}`);
        return response.data;
    },
    getAll: async () => {
        const response = await api.get('/service-requests');
        return response.data;
    }
};

export default api;
