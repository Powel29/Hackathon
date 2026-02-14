import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Generate a random mobile number and aadhaar for testing
const randomMobile = '9' + Math.floor(100000000 + Math.random() * 900000000);
// Verhoeff valid aadhaar generator is complex, so we'll use a known valid one for now, 
// OR we can rely on the backend mock if we don't have a generator.
// Let's use the one that worked before: 123456789010. 
// BUT we need a NEW user, so we might need to delete it first or use a different one.
// Since we don't have direct DB access easily here, let's try a different one if possible, 
// or just rely on the fact that if we use a new mobile, it might be enough? 
// No, backend checks Aadhaar uniqueness via hash.
// 
// Let's try to register with the SAME Aadhaar but NEW mobile -> Backend should say "Mobile already exists" or "User exists".
// Actually, we want to test "New User" flow. 
// If the user 123456789010 already exists, we can't register them again as "New".
//
// OPTION: We can use the /auth/initiate with a NEW valid Aadhaar.
// I'll use a few known valid Aadhaar numbers for testing.
// 999999990019 (Valid Verhoeff?) - Let's try to generate one locally or just use a hardcoded one.
//
// For this script, I'll try to use a hardcoded one that I hope doesn't exist yet, 
// or I'll just accept that I might need to manually clear DB.
//
// Actually, simplest is to use the `delete` command if I could, but I can't.
//
// Let's try a known valid Aadhaar: 123456789010. If it exists, we can't test "registration" fully in this script without DB reset.
// However, we can test the *initiate* and see what it returns.

// A valid Verhoeff Aadhaar generator would be best.
// Let's implement a simple validator/generator or just use a fixed one.
// For now, I'll use 123456789010 and assume the user might have reset the DB or we'll see "User exists" logs.

const TEST_USER = {
    // valid aadhaar (Verhoeff compliant) - let's hope this one is unused or we use a different one
    // 782474317884 is another valid one
    aadharNumber: '782474317884',
    mobileNumber: randomMobile,
    fullName: "Test User From Script",
    dateOfBirth: "1990-01-01",
    gender: "Male",
    address: "123 Test Street, Script City"
};

async function testRegistration() {
    try {
        console.log(`🚀 Starting Registration Test for Aadhaar: ${TEST_USER.aadharNumber}, Mobile: ${TEST_USER.mobileNumber}`);

        // 1. Initiate Auth (Send OTP)
        console.log('\n1️⃣ Initiating Auth...');
        try {
            const initResponse = await axios.post(`${API_URL}/auth/initiate`, {
                aadharNumber: TEST_USER.aadharNumber,
                mobileNumber: TEST_USER.mobileNumber
            });
            console.log('✅ Initiate Success:', initResponse.data);

            if (!initResponse.data.isNewUser) {
                console.warn('⚠️ User already exists! Cannot test FULL registration flow (data saving).');
                // We can still continue to login, but we won't verify the "saving" part unless update logic allows it.
                // Our backend update logic: "if (!citizen) ... else ... update lastLoginAt".
                // So updating data only happens for NEW users.
                // I will exit here if user exists, because the test is invalid for "registration data saving".
                console.log('🛑 Aborting test because user already exists. Please clear DB or use new Aadhaar.');
                return;
            }

            const otp = initResponse.data._demoOTP;
            console.log(`🔑 Received Demo OTP: ${otp}`);

            // 2. Verify OTP with Custom Data
            console.log('\n2️⃣ Verifying OTP with Custom User Data...');
            const verifyResponse = await axios.post(`${API_URL}/auth/verify-otp`, {
                aadharNumber: TEST_USER.aadharNumber,
                otp: otp,
                userData: {
                    fullName: TEST_USER.fullName,
                    dateOfBirth: TEST_USER.dateOfBirth,
                    gender: TEST_USER.gender,
                    address: TEST_USER.address,
                    email: "test@script.com"
                }
            });

            console.log('✅ Verify Success:', verifyResponse.data);

            // 3. Validation
            const user = verifyResponse.data.user;
            console.log('\n3️⃣ Validating Saved Data...');
            if (user.name === TEST_USER.fullName) {
                console.log('✅ Name Matches!');
            } else {
                console.error(`❌ Name Mismatch! Expected: ${TEST_USER.fullName}, Got: ${user.name}`);
            }

            // Backend might not return address/DOB in the "user" object of the response, check login response structure.
            // "user": { aadharNumber, name, mobile, email, ... }
            if (user.email === "test@script.com") {
                console.log('✅ Email Matches!');
            } else {
                console.log(`⚠️ Email check failed or not returned. Got: ${user.email}`);
            }

        } catch (error) {
            console.error('❌ Step Failed:', error.response ? error.response.data : error.message);
        }

    } catch (error) {
        console.error('❌ Test Failed:', error);
    }
}

testRegistration();
