import api from '../api.js';
import { tokenStrategy } from '../../core/security/storagePolicy';

/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls
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
                tokenStrategy.setToken(response.data.token);
            }
            if (response.data.user) {
                tokenStrategy.setUser(response.data.user);
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
 * Logout user
 */
export async function logout() {
    try {
        await api.post('/auth/logout');
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        tokenStrategy.clearToken();
    }
    return {
        success: true,
        message: 'Logged out successfully'
    };
}

/**
 * Resend OTP
 */
export async function resendOTP(request) {
    try {
        // Call backend API
        const response = await api.post('/auth/resend-otp', {
            aadharNumber: request.aadhaarNumber,
            mobileNumber: request.mobileNumber
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
