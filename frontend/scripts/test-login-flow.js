import axios from 'axios';

const API_URL = 'http://localhost:5001/api';
const AADHAAR = '123456789010'; // Valid Test Aadhaar
const MOBILE = '9999999999';

async function testLoginFlow() {
    console.log('🚀 Starting Login Flow Verification');
    console.log('-----------------------------------');

    try {
        // Step 1: Initiate Auth
        console.log(`1. Sending OTP to ${MOBILE} for Aadhaar ${AADHAAR}...`);
        const initResponse = await axios.post(`${API_URL}/auth/initiate`, {
            aadharNumber: AADHAAR,
            mobileNumber: MOBILE
        });

        if (initResponse.data.success) {
            console.log('✅ OTP Sent Successfully!');

            // In Dev mode, backend returns the OTP
            const otp = initResponse.data._demoOTP;
            console.log(`ℹ️  Received Demo OTP: ${otp}`);

            if (!otp) {
                console.error('❌ No Demo OTP received. Ensure NODE_ENV is "development".');
                return;
            }

            // Step 2: Verify OTP
            console.log(`\n2. Verifying OTP ${otp}...`);
            const verifyResponse = await axios.post(`${API_URL}/auth/verify-otp`, {
                aadharNumber: AADHAAR,
                otp: otp
            });

            if (verifyResponse.data.success) {
                console.log('✅ OTP Verified Successfully!');
                console.log('-----------------------------------');
                console.log('🎉 LOGIN SUCCESSFUL');
                console.log('Token:', verifyResponse.data.token ? '(Present)' : '(Missing)');
                const userName = verifyResponse.data.user?.name ?? '<no user>';
                console.log('User:', userName);
            } else {
                console.error('❌ OTP Verification Failed');
            }

        } else {
            console.error('❌ Failed to Send OTP');
        }

    } catch (error) {
        console.error('❌ Error during test:', error.response ? error.response.data : error.message);
    }
}

testLoginFlow();
