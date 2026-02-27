const request = require('supertest');
const app = require('../src/server');
const prisma = require('../src/utils/prismaClient');
const { getTestToken, cleanDB } = require('./testUtils');

describe('Service Account API', () => {
    let authToken;
    let testAccountId;
    const testAadhaar = '999999990003';
    const testMobile = '9876543210';

    beforeAll(async () => {
        authToken = await getTestToken(testAadhaar, testMobile);
    }, 15000);

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
                    accountNumber: `ELEC_TEST_${Date.now()}`
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.account).toBeDefined();
            expect(res.body.account.accountId).toBeDefined();
            testAccountId = res.body.account.accountId;
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
                .send({ serviceType: 'WATER', accountNumber: 'WATER123' });
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        test('Should fail with missing required fields', async () => {
            const res = await request(app)
                .post('/api/service-accounts/link')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ serviceType: 'WATER' });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/service-accounts/:accountId', () => {
        test('Should return service account details for valid account ID', async () => {
            if (!testAccountId) return;
            const res = await request(app)
                .get(`/api/service-accounts/${testAccountId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.account.accountId).toBe(testAccountId);
        });

        test('Should fail for non-existent account ID', async () => {
            const res = await request(app)
                .get('/api/service-accounts/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        test('Should fail without authentication', async () => {
            const res = await request(app)
                .get('/api/service-accounts/any-id');
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });
});
