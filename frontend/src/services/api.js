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

// Auth Service
export const authService = {
    login: async (credentials) => {
        const { data } = await api.post('/auth/login', credentials);
        return data;
    },
    sendOTP: async (mobile) => {
        const { data } = await api.post('/auth/send-otp', { mobile });
        return data;
    },
    verifyOTP: async (mobile, otp) => {
        const { data } = await api.post('/auth/verify-otp', { mobile, otp });
        return data;
    }
};

// Bill Service
export const billService = {
    getUserBills: async () => {
        const { data } = await api.get('/bills');
        return data;
    },
    getBillByNumber: async (billNumber) => {
        const { data } = await api.get(`/bills/${billNumber}`);
        return data;
    }
};

// Payment Service
export const paymentService = {
    createOrder: async (orderData) => {
        const { data } = await api.post('/payments/create-order', orderData);
        return data;
    },
    verifyPayment: async (paymentData) => {
        const { data } = await api.post('/payments/verify', paymentData);
        return data;
    }
};

// Complaint Service
export const complaintService = {
    submit: async (complaintData) => {
        const { data } = await api.post('/complaints', complaintData);
        return data;
    },
    track: async (id) => {
        const { data } = await api.get(`/complaints/${id}`);
        return data;
    },
    getUserComplaints: async () => {
        const { data } = await api.get('/complaints');
        return data;
    }
};

// Connection Service
export const connectionService = {
    requestNew: async (connectionData) => {
        const { data } = await api.post('/connections', connectionData);
        return data;
    },
    track: async (id) => {
        const { data } = await api.get(`/connections/${id}`);
        return data;
    }
};

export default api;
