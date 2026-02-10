const crypto = require('crypto');

/**
 * Generate 6-digit OTP
 */
function generateOTP() {
    return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Hash OTP for secure storage
 */
function hashOTP(otp) {
    return crypto
        .createHash('sha256')
        .update(otp + process.env.OTP_SALT)
        .digest('hex');
}

/**
 * Send OTP via SMS (Mock for demo)
 */
async function sendOTP(mobileNumber, otp) {
    // In production: Integrate SMS gateway (Twilio, MSG91, etc.)
    console.log(`📱 SMS to ${mobileNumber}: Your SUVIDHA OTP is ${otp}. Valid for 5 minutes.`);

    // Simulate SMS delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return true;
}

module.exports = {
    generateOTP,
    hashOTP,
    sendOTP
};