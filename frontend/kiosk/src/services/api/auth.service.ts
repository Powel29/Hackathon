/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls
 * Currently using mock data - replace with actual database calls when ready
 */

import { query } from '../../db/config';

export interface LoginRequest {
  aadhaarNumber: string;
}

export interface OTPVerifyRequest {
  aadhaarNumber: string;
  otp: string;
}

export interface VerifyConsumerIdRequest {
  aadhaarNumber: string;
  consumerId: string;
  serviceType: string;
}

export interface User {
  userId: string;
  aadhaarNumber: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  preferredLanguage?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Send OTP to user's registered mobile number
 */
export async function sendOTP(request: LoginRequest): Promise<AuthResponse> {
  try {
    // Database implementation (uncomment when ready):
    /*
    // Check if user exists
    const userResult = await query(
      'SELECT user_id, aadhaar_number, mobile_number FROM users WHERE aadhaar_number = $1 AND is_active = true',
      [request.aadhaarNumber]
    );

    if (userResult.rows.length === 0) {
      return {
        success: false,
        message: 'User not found',
        error: 'INVALID_AADHAAR'
      };
    }

    const user = userResult.rows[0];
    
    // Generate OTP (6-digit random number)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Calculate expiry (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    // Store OTP in database
    await query(
      `INSERT INTO otp_verifications 
       (aadhaar_number, otp_code, mobile_number, purpose, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [request.aadhaarNumber, otp, user.mobile_number, 'login', expiresAt]
    );
    
    // Send SMS (integrate with SMS gateway)
    // await sendSMS(user.mobile_number, `Your SUVIDHA OTP is: ${otp}. Valid for 5 minutes.`);
    
    return {
      success: true,
      message: 'OTP sent successfully',
      data: { mobileNumber: user.mobile_number.replace(/\d(?=\d{4})/g, '*') }
    };
    */

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
export async function verifyOTP(request: OTPVerifyRequest): Promise<AuthResponse> {
  try {
    // Database implementation (uncomment when ready):
    /*
    // Get OTP record
    const otpResult = await query(
      `SELECT otp_id, otp_code, expires_at, attempts_count, max_attempts, is_verified
       FROM otp_verifications
       WHERE aadhaar_number = $1 AND purpose = 'login'
       ORDER BY created_at DESC
       LIMIT 1`,
      [request.aadhaarNumber]
    );

    if (otpResult.rows.length === 0) {
      return {
        success: false,
        message: 'No OTP found for this Aadhaar number',
        error: 'OTP_NOT_FOUND'
      };
    }

    const otpRecord = otpResult.rows[0];
    
    // Check if already verified
    if (otpRecord.is_verified) {
      return {
        success: false,
        message: 'OTP already used',
        error: 'OTP_ALREADY_USED'
      };
    }
    
    // Check if expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      return {
        success: false,
        message: 'OTP expired',
        error: 'OTP_EXPIRED'
      };
    }
    
    // Check attempts
    if (otpRecord.attempts_count >= otpRecord.max_attempts) {
      return {
        success: false,
        message: 'Maximum attempts exceeded',
        error: 'MAX_ATTEMPTS_EXCEEDED'
      };
    }
    
    // Increment attempts
    await query(
      'UPDATE otp_verifications SET attempts_count = attempts_count + 1 WHERE otp_id = $1',
      [otpRecord.otp_id]
    );
    
    // Verify OTP
    if (request.otp !== otpRecord.otp_code) {
      return {
        success: false,
        message: 'Invalid OTP',
        error: 'INVALID_OTP',
        data: { attemptsRemaining: otpRecord.max_attempts - otpRecord.attempts_count - 1 }
      };
    }
    
    // Mark OTP as verified
    await query(
      'UPDATE otp_verifications SET is_verified = true, verified_at = CURRENT_TIMESTAMP WHERE otp_id = $1',
      [otpRecord.otp_id]
    );
    
    // Get user details
    const userResult = await query(
      'SELECT user_id, aadhaar_number, full_name, mobile_number, email, preferred_language FROM users WHERE aadhaar_number = $1',
      [request.aadhaarNumber]
    );
    
    const user = userResult.rows[0];
    
    // Update last login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );
    
    // Create session token (implement JWT or similar)
    const sessionToken = generateSessionToken(user);
    
    // Store session
    await query(
      `INSERT INTO user_sessions (user_id, session_token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.user_id, sessionToken, new Date(Date.now() + 24 * 60 * 60 * 1000)]
    );
    
    return {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          userId: user.user_id,
          aadhaarNumber: user.aadhaar_number,
          fullName: user.full_name,
          mobileNumber: user.mobile_number,
          email: user.email,
          preferredLanguage: user.preferred_language
        },
        sessionToken
      }
    };
    */

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
export async function verifyConsumerId(request: VerifyConsumerIdRequest): Promise<AuthResponse> {
  try {
    // Database implementation (uncomment when ready):
    /*
    // Get user
    const userResult = await query(
      'SELECT user_id FROM users WHERE aadhaar_number = $1',
      [request.aadhaarNumber]
    );
    
    if (userResult.rows.length === 0) {
      return {
        success: false,
        message: 'User not found',
        error: 'INVALID_USER'
      };
    }
    
    const userId = userResult.rows[0].user_id;
    
    // Check if consumer ID exists for this user and service
    const consumerResult = await query(
      `SELECT consumer_service_id, consumer_id, service_type, connection_status
       FROM consumer_services
       WHERE user_id = $1 AND service_type = $2 AND consumer_id = $3`,
      [userId, request.serviceType, request.consumerId]
    );
    
    if (consumerResult.rows.length === 0) {
      return {
        success: false,
        message: 'Consumer ID not found for this service',
        error: 'INVALID_CONSUMER_ID'
      };
    }
    
    const consumerService = consumerResult.rows[0];
    
    if (consumerService.connection_status !== 'active') {
      return {
        success: false,
        message: 'Service connection is not active',
        error: 'INACTIVE_CONNECTION'
      };
    }
    
    // Log audit
    await query(
      `INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id)
       VALUES ($1, $2, $3, $4)`,
      [userId, 'consumer_verification', 'consumer_service', consumerService.consumer_service_id]
    );
    
    return {
      success: true,
      message: 'Consumer ID verified successfully',
      data: {
        consumerServiceId: consumerService.consumer_service_id,
        consumerId: consumerService.consumer_id,
        serviceType: consumerService.service_type
      }
    };
    */

    // Mock implementation
    console.log('Verifying Consumer ID:', request.consumerId, 'for service:', request.serviceType);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock valid consumer IDs
    const validConsumerIds: Record<string, string[]> = {
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
export async function logout(sessionToken: string): Promise<AuthResponse> {
  try {
    // Database implementation (uncomment when ready):
    /*
    await query(
      'UPDATE user_sessions SET is_active = false WHERE session_token = $1',
      [sessionToken]
    );
    */

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
function generateSessionToken(user: any): string {
  // In production, use JWT or similar secure token generation
  return `session_${user.user_id}_${Date.now()}`;
}

/**
 * Resend OTP
 */
export async function resendOTP(request: LoginRequest): Promise<AuthResponse> {
  try {
    // Database implementation (uncomment when ready):
    /*
    // Invalidate previous OTPs
    await query(
      'UPDATE otp_verifications SET is_verified = true WHERE aadhaar_number = $1 AND purpose = $2 AND is_verified = false',
      [request.aadhaarNumber, 'login']
    );
    */
    
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
