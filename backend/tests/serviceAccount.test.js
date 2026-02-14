const request = require('supertest');
const app = require('../src/server');
const prisma = require('../src/utils/prismaClient');

describe('Service Account API', () => {
    let authToken;
    let testAccountId;
    const testAadhaar = '999999990003'; // Valid Aadhaar with Verhoeff checksum
    const testMobile = '9876543210';

    // Setup: Get auth token before running service account tests
    beforeAll(async () => {
        try {
            // Cleanup: Delete test user and related records to ensure clean state
            const { hashAadhaar } = require('../src/utils/aadhaarValidator');
            const aadharHash = hashAadhaar(testAadhaar);

            // Delete in correct order (foreign key constraints)
            await prisma.serviceAccount.deleteMany({ where: { citizenId: testAadhaar } });
            await prisma.authSession.deleteMany({ where: { citizenId: testAadhaar } });
            await prisma.oTPVerification.deleteMany({ where: { citizenId: testAadhaar } });
            await prisma.auditLog.deleteMany({ where: { citizenId: testAadhaar } });
            await prisma.kioskLog.deleteMany({ where: { citizenId: testAadhaar } });
            await prisma.citizen.deleteMany({ where: { aadharHash } });

            // Create test user directly in database to avoid new user registration bug
            await prisma.citizen.create({
                data: {
                    aadharNumber: testAadhaar,
                    aadharHash: aadharHash,
                    fullName: 'Test User',
                    mobileNumber: testMobile,
                    isVerified: true,
                    isActive: true
                }
            });

            console.log('Test user created');

            // First, initiate auth
            const initiateRes = await request(app)
                .post('/api/auth/initiate')
                .send({
                    aadharNumber: testAadhaar,
                    mobileNumber: testMobile
                });

            if (initiateRes.status !== 200) {
                console.error('Initiate response:', initiateRes.body);
                throw new Error('Failed to initiate auth');
            }

            console.log('Initiate succeeded. Response:', initiateRes.body);

            // Get the demo OTP if in development mode
            if (process.env.NODE_ENV === 'development' && initiateRes.body._demoOTP) {
                const otp = initiateRes.body._demoOTP;
                console.log('Using demo OTP:', otp);
            } else {
                throw new Error('Tests require NODE_ENV=development to receive demo OTP');
            }
            // Verify OTP to get token
            const verifyRes = await request(app)
                .post('/api/auth/verify-otp')
                .send({
                    aadharNumber: testAadhaar,
                    otp: otp
                });

            console.log('Verify response status:', verifyRes.status);
            console.log('Verify response body:', verifyRes.body);

            if (verifyRes.status !== 200) {
                console.error('Verify response:', verifyRes.body);
                throw new Error('Failed to verify OTP');
            }

            authToken = verifyRes.body.token;

            if (!authToken) {
                throw new Error('No token received from verify-otp');
            }

            console.log('Auth token obtained successfully');
        } catch (error) {
            console.error('BeforeAll error:', error.message);
            throw error;
        }
    }, 15000);

    // Cleanup: Close database connections
    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('GET /api/service-accounts', () => {
        test('Should return list of service accounts for authenticated user', async () => {
            const res = await request(app)
                .get('/api/service-accounts')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.accounts).toBeDefined();
            expect(Array.isArray(res.body.accounts)).toBe(true);
        });

        test('Should fail without authentication token', async () => {
            const res = await request(app)
                .get('/api/service-accounts');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        test('Should fail with invalid token', async () => {
            const res = await request(app)
                .get('/api/service-accounts')
                .set('Authorization', 'Bearer invalid_token_here');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/service-accounts/link', () => {
        test('Should successfully link a new service account', async () => {
            const res = await request(app)
                .post('/api/service-accounts/link')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    serviceType: 'ELECTRICITY',
                    accountNumber: 'ELEC123456789'
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBeDefined();
            expect(res.body.account).toBeDefined();
            expect(res.body.account.accountId).toBeDefined();
            expect(res.body.account.serviceType).toBe('ELECTRICITY');
            expect(res.body.account.accountNumber).toBe('ELEC123456789');

            // Save account ID for later tests
            testAccountId = res.body.account.accountId;
        });

        test('Should fail to link duplicate service account', async () => {
            const res = await request(app)
                .post('/api/service-accounts/link')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    serviceType: 'ELECTRICITY',
                    accountNumber: 'ELEC123456789'
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error.code).toBe('ALREADY_LINKED');
        });

        test('Should fail with invalid service type', async () => {
            const res = await request(app)
                .post('/api/service-accounts/link')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    serviceType: 'INVALID_TYPE',
                    accountNumber: 'TEST123'
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('Should fail without authentication', async () => {
            const res = await request(app)
                .post('/api/service-accounts/link')
                .send({
                    serviceType: 'WATER',
                    accountNumber: 'WATER123'
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        test('Should fail with missing required fields', async () => {
            const res = await request(app)
                .post('/api/service-accounts/link')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    serviceType: 'WATER'
                    // Missing accountNumber
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('Should successfully link different service types', async () => {
            const serviceTypes = ['GAS', 'WATER', 'MUNICIPAL'];

            for (const serviceType of serviceTypes) {
                const res = await request(app)
                    .post('/api/service-accounts/link')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send({
                        serviceType: serviceType,
                        accountNumber: `${serviceType}_ACC_${Date.now()}`
                    });

                expect(res.status).toBe(200);
                expect(res.body.success).toBe(true);
                expect(res.body.account.serviceType).toBe(serviceType);
            }
        });
    });

    describe('GET /api/service-accounts/:accountId', () => {
        test('Should return service account details for valid account ID', async () => {
            const res = await request(app)
                .get(`/api/service-accounts/${testAccountId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.account).toBeDefined();
            expect(res.body.account.accountId).toBe(testAccountId);
            expect(res.body.account.bills).toBeDefined();
            expect(Array.isArray(res.body.account.bills)).toBe(true);
        });

        test('Should fail for non-existent account ID', async () => {
            const fakeUUID = '00000000-0000-0000-0000-000000000000';
            const res = await request(app)
                .get(`/api/service-accounts/${fakeUUID}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.error.code).toBe('ACCOUNT_NOT_FOUND');
        });

        test('Should fail without authentication', async () => {
            const res = await request(app)
                .get(`/api/service-accounts/${testAccountId}`);

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        test('Should fail with invalid UUID format', async () => {
            const res = await request(app)
                .get('/api/service-accounts/invalid-uuid')
                .set('Authorization', `Bearer ${authToken}`);

            // This might return 404 or 500 depending on Prisma's validation
            expect([404, 500]).toContain(res.status);
            expect(res.body.success).toBe(false);
        });
    });

    describe('Integration: Full Flow', () => {
        test('Should link account, retrieve list, and get details', async () => {
            // 1. Link a new account
            const linkRes = await request(app)
                .post('/api/service-accounts/link')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    serviceType: 'ELECTRICITY',
                    accountNumber: `INTEGRATION_TEST_${Date.now()}`
                });

            expect(linkRes.status).toBe(200);
            const newAccountId = linkRes.body.account.accountId;

            // 2. Get all accounts - should include the new one
            const listRes = await request(app)
                .get('/api/service-accounts')
                .set('Authorization', `Bearer ${authToken}`);

            expect(listRes.status).toBe(200);
            const accountExists = listRes.body.accounts.some(
                acc => acc.accountId === newAccountId
            );
            expect(accountExists).toBe(true);

            // 3. Get specific account details
            const detailsRes = await request(app)
                .get(`/api/service-accounts/${newAccountId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(detailsRes.status).toBe(200);
            expect(detailsRes.body.account.accountId).toBe(newAccountId);
        });
    });
});
