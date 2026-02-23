import api from '../api.js';

/**
 * Bills and Payments Service
 * 
 * Handles all billing and payment-related API calls
 */

/**
 * Get bills for a consumer service or user
 */
export async function getBills(filters = {}) {
    try {
        console.log('🔍 Getting bills...', filters);
        const response = await api.get('/bills', { params: filters });
        console.log('✅ Bills Response:', response.data);
        return response.data.bills || [];
    } catch (error) {
        console.error('❌ API getBills error:', error);
        throw error;
    }
}

/**
 * Get bill by bill number
 */
export async function getBill(billNumber) {
    try {
        console.log(`🔍 Getting bill by number: ${billNumber}`);
        const response = await api.get(`/bills/${billNumber}`);
        console.log('✅ Bill Response:', response.data);
        return response.data.bill;
    } catch (error) {
        console.error('❌ API getBill error:', error);
        throw error;
    }
}

/**
 * Process payment for a bill
 */
export async function processPayment(paymentData) {
    try {
        console.log('🔍 Processing payment:', paymentData);
        const response = await api.post('/bills/pay', paymentData);
        console.log('✅ Payment Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ API processPayment error:', error);
        throw error;
    }
}

/**
 * Get payment history
 */
export async function getPaymentHistory(filters = {}) {
    try {
        console.log('🔍 Getting payment history...', filters);
        const response = await api.get('/bills/payments', { params: filters });
        console.log('✅ Payment History Response:', response.data);
        return response.data.payments || [];
    } catch (error) {
        console.error('❌ API getPaymentHistory error:', error);
        throw error;
    }
}

// Re-export as a grouped object
export const billService = {
    getUserBills: getBills, // Compatibility with api.js naming
    getBills,
    getBillByNumber: getBill,
    getBill,
    processPayment,
    getPaymentHistory
};
