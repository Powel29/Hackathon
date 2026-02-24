import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const kioskService = {
    sendHeartbeat: async () => {
        try {
            // In a real scenario, these would come from the hardware/system layer
            const kioskData = {
                kioskId: 'DEMO-KIOSK-01',
                location: 'Main Bus Terminal',
                printer: 'ok',
                network: 'excellent',
                status: 'online'
            };

            const response = await axios.post(`${API_URL}/kiosks/heartbeat`, kioskData);
            return response.data;
        } catch (error) {
            console.error('Failed to send heartbeat:', error);
            return null;
        }
    }
};
