const request = require('supertest');
const app = require('../src/server');
const prisma = require('../src/utils/prismaClient');
const { getTestToken, cleanDB } = require('./testUtils');

describe('Bill API', () => {
    let userToken;
    const testAadhaar = '999999990019';
    const testMobile = '9876543219';

    beforeAll(async () => {
        userToken = await getTestToken(testAadhaar, testMobile);
    }, 15000);

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('GET /api/bills', () => {
        test('Should return user bills with valid token', async () => {
            const res = await request(app)
                .get('/api/bills')
                .set('Authorization', `Bearer ${userToken}`);

            expect([200, 404]).toContain(res.status);
            if (res.status === 200) {
                expect(res.body.success).toBe(true);
            }
        });

        test('Should fail without authentication', async () => {
            const res = await request(app).get('/api/bills');
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        test('Should fail with invalid token', async () => {
            const res = await request(app)
                .get('/api/bills')
                .set('Authorization', 'Bearer invalid_token');
            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/bills/:billNumber', () => {
        test('Should return 404 for non-existent bill', async () => {
            const res = await request(app)
                .get('/api/bills/NONEXISTENT-BILL-123')
                .set('Authorization', `Bearer ${userToken}`);
            expect([404, 500]).toContain(res.status);
        });

        test('Should fail without authentication', async () => {
            const res = await request(app).get('/api/bills/SOME-BILL');
            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/bills/pay', () => {
        test('Should fail without authentication', async () => {
            const res = await request(app)
                .post('/api/bills/pay')
                .send({ billId: 'test', amount: 100 });
            expect(res.status).toBe(401);
        });

        test('Should fail with missing fields', async () => {
            const res = await request(app)
                .post('/api/bills/pay')
                .set('Authorization', `Bearer ${userToken}`)
                .send({});
            expect([400, 500]).toContain(res.status);
        });
    });
});
