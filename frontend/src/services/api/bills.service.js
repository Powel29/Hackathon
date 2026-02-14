/**
 * Bills and Payments Service
 * 
 * Handles all billing and payment-related API calls
 * Currently using mock data - replace with actual database calls when ready
 */

/**
 * Get bills for a consumer service
 */
export async function getBills(consumerServiceId, status) {
    try {
        // Mock implementation
        console.log('Getting bills for consumer service:', consumerServiceId);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockBills = [
            {
                billId: '1',
                billNumber: 'ELEC-2026-001',
                consumerServiceId,
                serviceType: 'electricity',
                amount: 2200,
                taxAmount: 250,
                totalAmount: 2450,
                dueDate: '2026-02-10',
                status: 'pending',
                billingPeriod: 'January 2026',
                billingPeriodStart: '2026-01-01',
                billingPeriodEnd: '2026-01-31',
                consumptionUnits: 350,
                previousReading: 5420,
                currentReading: 5770,
                consumerNumber: 'EC123456789'
            },
            {
                billId: '2',
                billNumber: 'ELEC-2025-012',
                consumerServiceId,
                serviceType: 'electricity',
                amount: 1900,
                taxAmount: 200,
                totalAmount: 2100,
                dueDate: '2026-01-10',
                status: 'paid',
                billingPeriod: 'December 2025',
                billingPeriodStart: '2025-12-01',
                billingPeriodEnd: '2025-12-31',
                consumptionUnits: 320,
                previousReading: 5100,
                currentReading: 5420,
                consumerNumber: 'EC123456789'
            }
        ];

        return status ? mockBills.filter(bill => bill.status === status) : mockBills;
    } catch (error) {
        console.error('Get bills error:', error);
        return [];
    }
}

/**
 * Get bill by ID or number
 */
export async function getBill(billId, billNumber) {
    try {
        // Mock implementation
        console.log('Getting bill:', { billId, billNumber });

        return {
            billId: billId || '1',
            billNumber: billNumber || 'ELEC-2026-001',
            consumerServiceId: 'mock-service-id',
            serviceType: 'electricity',
            amount: 2200,
            taxAmount: 250,
            totalAmount: 2450,
            dueDate: '2026-02-10',
            status: 'pending',
            billingPeriod: 'January 2026',
            billingPeriodStart: '2026-01-01',
            billingPeriodEnd: '2026-01-31',
            consumptionUnits: 350,
            previousReading: 5420,
            currentReading: 5770,
            consumerNumber: 'EC123456789'
        };
    } catch (error) {
        console.error('Get bill error:', error);
        return null;
    }
}

/**
 * Process payment for a bill
 */
export async function processPayment(request) {
    try {
        // Mock implementation
        console.log('Processing payment:', request);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate payment gateway processing
        const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        return {
            success: true,
            payment: {
                paymentId: 'mock-payment-id-' + Date.now(),
                billId: request.billId,
                transactionId,
                amount: request.amount,
                paymentMethod: request.paymentMethod,
                paymentStatus: 'success',
                paidAt: new Date().toISOString()
            }
        };
    } catch (error) {
        console.error('Process payment error:', error);
        return { success: false, error: String(error) };
    }
}

/**
 * Get payment history for a user
 */
export async function getPaymentHistory(userId) {
    try {
        // Mock implementation
        console.log('Getting payment history for user:', userId);

        return [
            {
                paymentId: '1',
                billId: '2',
                transactionId: 'TXN-1738325400000-4567',
                amount: 2100,
                paymentMethod: 'upi',
                paymentStatus: 'success',
                paidAt: '2026-01-05T14:30:00'
            }
        ];
    } catch (error) {
        console.error('Get payment history error:', error);
        return [];
    }
}

/**
 * Send receipt via SMS or Email
 */
export async function sendReceipt(paymentId, method, contact) {
    try {
        // Mock implementation
        console.log('Sending receipt:', { paymentId, method, contact });

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return { success: true };
    } catch (error) {
        console.error('Send receipt error:', error);
        return { success: false, error: String(error) };
    }
}
