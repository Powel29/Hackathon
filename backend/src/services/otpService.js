const twilio = require("twilio");

// Ensure environment variables are loaded
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_VERIFY_SERVICE_SID) {
    console.warn("⚠️ Twilio configuration is missing from environment variables!");
}

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

/**
 * Send OTP via Twilio Verify
 * @param {string} phone - Mobile number (e.g., 9999999999)
 */
exports.sendOTP = async (phone) => {
    try {
        // Twilio requires E.164 format (+91XXXXXXXXXX for India)
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

        return await client.verify.v2
            .services(serviceSid)
            .verifications.create({
                to: formattedPhone,
                channel: "sms",
            });
    } catch (error) {
        console.error("❌ Twilio sendOTP Error:", error);
        throw error;
    }
};

/**
 * Verify OTP via Twilio Verify
 * @param {string} phone - Mobile number
 * @param {string} code - The 6-digit OTP code sent to user
 */
exports.verifyOTP = async (phone, code) => {
    try {
        // Twilio requires E.164 format
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

        return await client.verify.v2
            .services(serviceSid)
            .verificationChecks.create({
                to: formattedPhone,
                code: code,
            });
    } catch (error) {
        console.error("❌ Twilio verifyOTP Error:", error);
        throw error;
    }
};
