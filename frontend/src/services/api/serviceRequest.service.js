import api from '../api';

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
