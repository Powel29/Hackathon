import api from '../api.js';

/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls
 * Currently using mock data - replace with actual database calls when ready
 */

/**
 * Send OTP to user's registered mobile number
 */
export async function sendOTP(request) {
    try {
        console.log('Sending OTP for Aadhaar:', request.aadhaarNumber);
        const payload = {
            aadharNumber: request.aadhaarNumber
        };

        if (request.mobileNumber) {
            payload.mobileNumber = request.mobileNumber;
        }

        // Call backend API
        const response = await api.post('/auth/initiate', payload);

        return response.data;
    } catch (error) {
        console.error('Send OTP error:', error);

        // Extract specific error details from backend response
        const errorData = error.response?.data?.error || {};

        return {
            success: false,
            message: errorData.message || 'Failed to send OTP',
            code: errorData.code || 'UNKNOWN_ERROR',
            error: String(error)
        };
    }
}

/**
 * Verify OTP and authenticate user
 */
export async function verifyOTP(request) {
    try {
        console.log('Verifying OTP for Aadhaar: [REDACTED]');
        // Call backend API
        const response = await api.post('/auth/verify-otp', {
            aadharNumber: request.aadhaarNumber,
            otp: request.otp,
            userData: request.userData,
            mobileNumber: request.mobileNumber || request.userData?.mobileNumber
        });

        if (response.data.success) {
            // Store token if needed, usually handled by interceptors if returned in headers or body
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
        }

        return response.data;
    } catch (error) {
        console.error('Verify OTP error:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to verify OTP',
            error: String(error)
        };
    }
}

/**
 * Verify consumer ID for service access
 */
export async function verifyConsumerId(request) {
    try {
        // Mock implementation for now as per instructions (backend might not have this yet)
        console.log('Verifying Consumer ID:', request.consumerId, 'for service:', request.serviceType);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock valid consumer IDs
        const validConsumerIds = {
            electricity: ['EC123456789', 'ELEC-001', 'E12345'],
            gas: ['GC987654321', 'GAS-001', 'G54321'],
            water: ['WC987654321', 'WATER-001', 'W98765'],
            municipal: ['MC456789123', 'MUN-001', 'M11111']
        };

        const validIds = validConsumerIds[request.serviceType] || [];

        if (validIds.includes(request.consumerId)) {
            return {
                success: true,
                message: 'Consumer ID verified successfully',
                data: {
                    consumerServiceId: 'mock-service-id-' + Date.now(),
                    consumerId: request.consumerId,
                    serviceType: request.serviceType
                }
            };
        } else {
            return {
                success: false,
                message: 'Consumer ID not found for this service',
                error: 'INVALID_CONSUMER_ID'
            };
        }
    } catch (error) {
        console.error('Verify Consumer ID error:', error);
        return {
            success: false,
            message: 'Failed to verify consumer ID',
            error: String(error)
        };
    }
}

/**
 * Logout user
 */
export async function logout(sessionToken) {
    try {
        await api.post('/auth/logout');
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        return {
            success: true,
            message: 'Logged out successfully'
        };
    } catch (error) {
        console.error('Logout error:', error);
        return {
            success: false,
            message: 'Failed to logout',
            error: String(error)
        };
    }
}

/**
 * Resend OTP
 */
export async function resendOTP(request) {
    try {
        // Call backend API
        const response = await api.post('/auth/resend-otp', {
            aadharNumber: request.aadhaarNumber
        });
        return response.data;
    } catch (error) {
        console.error('Resend OTP error:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to resend OTP',
            error: String(error)
        };
    }
}
