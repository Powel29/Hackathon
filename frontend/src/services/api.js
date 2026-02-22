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

// Handle 401 - clear session and redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const currentPath = window.location.pathname;
            // Only redirect if not already on login page to avoid redirect loops
            if (!currentPath.includes('/login') && !currentPath.includes('/auth')) {
                console.warn('Session expired or invalid. Redirecting to login...');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/kiosk/login';
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
                localStorage.setItem('token', response.data.token);
                if (response.data.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
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
            localStorage.removeItem('token');
            localStorage.removeItem('user');
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

            // Inject Mock Property Tax Bill (for demo/interface similarity task)
            const ptBill = {
                billId: 'pt-2026-001',
                billNumber: 'PT-2026-1001',
                consumerNumber: 'PID-987654321', // Matches PropertyTaxPayment default
                serviceType: 'MUNICIPAL', // Uppercase to match filter
                amount: 4550,
                dueDate: '2026-03-31',
                status: 'pending',
                billingPeriod: '2025-2026'
            };

            // Avoid duplicates if backend already returns it (unlikely for now)
            if (!bills.find(b => b.billNumber === ptBill.billNumber)) {
                bills.push(ptBill);
            }

            return bills;
        } catch (error) {
            console.error('❌ API getUserBills error:', error);
            // Fallback mock data for Property Tax task if backend is offline/error
            return [{
                billId: 'pt-2026-001',
                billNumber: 'PT-2026-1001',
                consumerNumber: 'PID-987654321',
                serviceType: 'MUNICIPAL',
                amount: 4550,
                dueDate: '2026-03-31',
                status: 'pending',
                billingPeriod: '2025-2026'
            }];
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
    }
};

export default api;
