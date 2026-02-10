/**
 * Bills and Payments Service
 * 
 * Handles all billing and payment-related API calls
 * Currently using mock data - replace with actual database calls when ready
 */

import { query, transaction } from '../../db/config';
import type { ServiceType } from '../../store/useStore';

export interface Bill {
  billId: string;
  billNumber: string;
  consumerServiceId: string;
  serviceType: ServiceType;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  billingPeriod: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  consumptionUnits?: number;
  previousReading?: number;
  currentReading?: number;
  consumerNumber: string;
}

export interface Payment {
  paymentId: string;
  billId: string;
  transactionId: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'success' | 'pending' | 'failed';
  paidAt: string;
}

export interface PaymentRequest {
  billId: string;
  userId: string;
  amount: number;
  paymentMethod: string;
}

/**
 * Get bills for a consumer service
 */
export async function getBills(consumerServiceId: string, status?: string): Promise<Bill[]> {
  try {
    // Database implementation (uncomment when ready):
    /*
    const whereClause = status 
      ? 'WHERE b.consumer_service_id = $1 AND b.status = $2'
      : 'WHERE b.consumer_service_id = $1';
    const params = status ? [consumerServiceId, status] : [consumerServiceId];
    
    const result = await query(
      `SELECT 
        b.bill_id,
        b.bill_number,
        b.consumer_service_id,
        b.amount,
        b.tax_amount,
        b.total_amount,
        b.due_date,
        b.status,
        b.billing_period,
        b.billing_period_start,
        b.billing_period_end,
        b.consumption_units,
        b.previous_reading,
        b.current_reading,
        cs.service_type,
        cs.consumer_id
       FROM bills b
       JOIN consumer_services cs ON b.consumer_service_id = cs.consumer_service_id
       ${whereClause}
       ORDER BY b.due_date DESC`,
      params
    );
    
    return result.rows.map(row => ({
      billId: row.bill_id,
      billNumber: row.bill_number,
      consumerServiceId: row.consumer_service_id,
      serviceType: row.service_type,
      amount: parseFloat(row.amount),
      taxAmount: parseFloat(row.tax_amount),
      totalAmount: parseFloat(row.total_amount),
      dueDate: row.due_date,
      status: row.status,
      billingPeriod: row.billing_period,
      billingPeriodStart: row.billing_period_start,
      billingPeriodEnd: row.billing_period_end,
      consumptionUnits: row.consumption_units ? parseFloat(row.consumption_units) : undefined,
      previousReading: row.previous_reading ? parseFloat(row.previous_reading) : undefined,
      currentReading: row.current_reading ? parseFloat(row.current_reading) : undefined,
      consumerNumber: row.consumer_id
    }));
    */

    // Mock implementation
    console.log('Getting bills for consumer service:', consumerServiceId);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockBills: Bill[] = [
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
export async function getBill(billId?: string, billNumber?: string): Promise<Bill | null> {
  try {
    // Database implementation (uncomment when ready):
    /*
    const whereClause = billId ? 'WHERE b.bill_id = $1' : 'WHERE b.bill_number = $1';
    const param = billId || billNumber;
    
    const result = await query(
      `SELECT 
        b.bill_id,
        b.bill_number,
        b.consumer_service_id,
        b.amount,
        b.tax_amount,
        b.total_amount,
        b.due_date,
        b.status,
        b.billing_period,
        b.billing_period_start,
        b.billing_period_end,
        b.consumption_units,
        b.previous_reading,
        b.current_reading,
        cs.service_type,
        cs.consumer_id
       FROM bills b
       JOIN consumer_services cs ON b.consumer_service_id = cs.consumer_service_id
       ${whereClause}`,
      [param]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      billId: row.bill_id,
      billNumber: row.bill_number,
      consumerServiceId: row.consumer_service_id,
      serviceType: row.service_type,
      amount: parseFloat(row.amount),
      taxAmount: parseFloat(row.tax_amount),
      totalAmount: parseFloat(row.total_amount),
      dueDate: row.due_date,
      status: row.status,
      billingPeriod: row.billing_period,
      billingPeriodStart: row.billing_period_start,
      billingPeriodEnd: row.billing_period_end,
      consumptionUnits: row.consumption_units ? parseFloat(row.consumption_units) : undefined,
      previousReading: row.previous_reading ? parseFloat(row.previous_reading) : undefined,
      currentReading: row.current_reading ? parseFloat(row.current_reading) : undefined,
      consumerNumber: row.consumer_id
    };
    */

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
export async function processPayment(request: PaymentRequest): Promise<{ success: boolean; payment?: Payment; error?: string }> {
  try {
    // Database implementation (uncomment when ready):
    /*
    return await transaction(async (client) => {
      // Check if bill exists and is not already paid
      const billResult = await client.query(
        'SELECT bill_id, total_amount, status FROM bills WHERE bill_id = $1',
        [request.billId]
      );
      
      if (billResult.rows.length === 0) {
        return { success: false, error: 'Bill not found' };
      }
      
      const bill = billResult.rows[0];
      
      if (bill.status === 'paid') {
        return { success: false, error: 'Bill already paid' };
      }
      
      if (parseFloat(bill.total_amount) !== request.amount) {
        return { success: false, error: 'Payment amount mismatch' };
      }
      
      // Generate transaction ID
      const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      // Insert payment record
      const paymentResult = await client.query(
        `INSERT INTO payments 
         (bill_id, user_id, transaction_id, amount, payment_method, payment_status, paid_at)
         VALUES ($1, $2, $3, $4, $5, 'success', CURRENT_TIMESTAMP)
         RETURNING payment_id, transaction_id, paid_at`,
        [request.billId, request.userId, transactionId, request.amount, request.paymentMethod]
      );
      
      const payment = paymentResult.rows[0];
      
      // Update bill status
      await client.query(
        'UPDATE bills SET status = $1 WHERE bill_id = $2',
        ['paid', request.billId]
      );
      
      // Generate receipt
      const receiptNumber = `RCPT-${Date.now()}`;
      await client.query(
        `INSERT INTO payment_receipts (payment_id, receipt_number)
         VALUES ($1, $2)`,
        [payment.payment_id, receiptNumber]
      );
      
      // Create notification
      await client.query(
        `INSERT INTO notifications (user_id, notification_type, title, message)
         VALUES ($1, 'payment_success', 'Payment Successful', $2)`,
        [request.userId, `Your payment of ₹${request.amount} was successful. Transaction ID: ${transactionId}`]
      );
      
      // Log audit
      await client.query(
        `INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id, new_value)
         VALUES ($1, 'payment_completed', 'payment', $2, $3)`,
        [request.userId, payment.payment_id, JSON.stringify({ transactionId, amount: request.amount })]
      );
      
      return {
        success: true,
        payment: {
          paymentId: payment.payment_id,
          billId: request.billId,
          transactionId: payment.transaction_id,
          amount: request.amount,
          paymentMethod: request.paymentMethod,
          paymentStatus: 'success',
          paidAt: payment.paid_at
        }
      };
    });
    */

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
export async function getPaymentHistory(userId: string): Promise<Payment[]> {
  try {
    // Database implementation (uncomment when ready):
    /*
    const result = await query(
      `SELECT 
        p.payment_id,
        p.bill_id,
        p.transaction_id,
        p.amount,
        p.payment_method,
        p.payment_status,
        p.paid_at
       FROM payments p
       WHERE p.user_id = $1
       ORDER BY p.paid_at DESC`,
      [userId]
    );
    
    return result.rows.map(row => ({
      paymentId: row.payment_id,
      billId: row.bill_id,
      transactionId: row.transaction_id,
      amount: parseFloat(row.amount),
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      paidAt: row.paid_at
    }));
    */

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
export async function sendReceipt(paymentId: string, method: 'sms' | 'email', contact: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Database implementation (uncomment when ready):
    /*
    // Update receipt record
    const field = method === 'sms' ? 'sent_via_sms' : 'sent_via_email';
    const timestampField = method === 'sms' ? 'sms_sent_at' : 'email_sent_at';
    
    await query(
      `UPDATE payment_receipts 
       SET ${field} = true, ${timestampField} = CURRENT_TIMESTAMP
       WHERE payment_id = $1`,
      [paymentId]
    );
    
    // Send via SMS/Email gateway
    // Implementation depends on gateway provider
    
    return { success: true };
    */

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
