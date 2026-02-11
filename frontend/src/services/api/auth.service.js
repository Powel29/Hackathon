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
        // Mock implementation
        console.log('Sending OTP for Aadhaar:', request.aadhaarNumber);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
            success: true,
            message: 'OTP sent successfully',
            data: {
                mobileNumber: '******1234',
                otp: '123456' // In production, this should NEVER be returned
            }
        };
    } catch (error) {
        console.error('Send OTP error:', error);
        return {
            success: false,
            message: 'Failed to send OTP',
            error: String(error)
        };
    }
}

/**
 * Verify OTP and authenticate user
 */
export async function verifyOTP(request) {
    try {
        // Mock implementation
        console.log('Verifying OTP for Aadhaar:', request.aadhaarNumber);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock validation
        if (request.otp === '123456') {
            return {
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        userId: 'mock-user-id-123',
                        aadhaarNumber: request.aadhaarNumber,
                        fullName: 'Rajesh Kumar',
                        mobileNumber: '+91 98765 43210',
                        email: 'rajesh.kumar@example.com',
                        preferredLanguage: 'en'
                    },
                    sessionToken: 'mock-session-token-' + Date.now()
                }
            };
        } else {
            return {
                success: false,
                message: 'Invalid OTP',
                error: 'INVALID_OTP',
                data: { attemptsRemaining: 2 }
            };
        }
    } catch (error) {
        console.error('Verify OTP error:', error);
        return {
            success: false,
            message: 'Failed to verify OTP',
            error: String(error)
        };
    }
}

/**
 * Verify consumer ID for service access
 */
export async function verifyConsumerId(request) {
    try {
        // Mock implementation
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
        // Mock implementation
        console.log('Logging out session:', sessionToken);

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
 * Helper function to generate session token (placeholder)
 */
function generateSessionToken(user) {
    // In production, use JWT or similar secure token generation
    return `session_${user.user_id}_${Date.now()}`;
}

/**
 * Resend OTP
 */
export async function resendOTP(request) {
    try {
        // Send new OTP
        return await sendOTP(request);
    } catch (error) {
        console.error('Resend OTP error:', error);
        return {
            success: false,
            message: 'Failed to resend OTP',
            error: String(error)
        };
    }
}
