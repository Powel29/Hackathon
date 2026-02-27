const request = require('supertest');
const app = require('../src/server');
const prisma = require('../src/utils/prismaClient');
const { cleanDB } = require('./testUtils');

describe('Authentication API', () => {
    const testAadhaar = '999999990019';
    const testMobile = '9876543219';
    let testOTP;
    let userToken;

    beforeAll(async () => {
        await cleanDB(testAadhaar, testMobile);
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

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
        }
    }, 10000);

    test('POST /api/auth/verify-otp - Success', async () => {
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
        const res = await request(app)
            .post('/api/auth/resend-otp')
            .send({
                aadharNumber: testAadhaar
            });

        if (res.status === 429) {
            expect(res.body.error.code).toBe('RESEND_TOO_SOON');
        } else {
            expect(res.status).toBe(200);
        }
    });
});
