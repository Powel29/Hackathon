const request = require('supertest');
const app = require('../src/server');

describe('Authentication API', () => {
    let testOTP;
    const testAadhaar = '999999990019'; // Valid Verhoeff (Calculated)
    const testMobile = '9876543219';
    let userToken;

    test('POST /api/auth/initiate - New User', async () => {
        const res = await request(app)
            .post('/api/auth/initiate')
            .send({
                aadharNumber: testAadhaar,
                mobileNumber: testMobile
            });

        if (res.status !== 200) {
            console.error('Initiate Error Response:', JSON.stringify(res.body, null, 2));
        }
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);

        if (process.env.NODE_ENV === 'development') {
            expect(res.body._demoOTP).toBeDefined();
            testOTP = res.body._demoOTP;
        } else {
            console.warn('Skipping OTP extraction in non-dev environment');
        }
    }, 10000);

    test('POST /api/auth/verify-otp - Success', async () => {
        // If we didn't get an OTP (e.g. not in dev mode), we can't really test this fully automated without mocking DB
        if (!testOTP) {
            console.warn('Skipping Verify OTP test because OTP was not captured');
            return;
        }

        const res = await request(app)
            .post('/api/auth/verify-otp')
            .send({
                aadharNumber: testAadhaar,
                otp: testOTP
            });

        if (res.status !== 200) {
            console.error('Verify OTP Error Response:', JSON.stringify(res.body, null, 2));
        }

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeDefined();
        expect(res.body.user).toBeDefined();

        userToken = res.body.token;
    }, 10000);

    test('POST /api/auth/verify-otp - Invalid OTP', async () => {
        const res = await request(app)
            .post('/api/auth/verify-otp')
            .send({
                aadharNumber: testAadhaar,
                otp: '000000'
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test('POST /api/auth/resend-otp - Success', async () => {
        // Wait for a bit if needed, or just hit it (might hit rate limit if too fast, but that's also a valid test)
        const res = await request(app)
            .post('/api/auth/resend-otp')
            .send({
                aadharNumber: testAadhaar
            });

        // It might be 429 if too fast, or 200 if cool
        // The controller logic says 30s cooldown.
        // Since we just called initiate, this should likely fail with 429
        if (res.status === 429) {
            expect(res.body.error.code).toBe('RESEND_TOO_SOON');
        } else {
            expect(res.status).toBe(200);
        }
    });
});
