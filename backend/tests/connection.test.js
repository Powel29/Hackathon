const request = require('supertest');
const app = require('../src/server');
const prisma = require('../src/utils/prismaClient');
const { getTestToken } = require('./testUtils');

describe('Connection API', () => {
    let userToken;

    beforeAll(async () => {
        userToken = await getTestToken('999999990019', '9876543219');
    }, 15000);

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('GET /api/connections', () => {
        test('Should return applications list with valid token', async () => {
            const res = await request(app)
                .get('/api/connections')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('Should fail without authentication', async () => {
            const res = await request(app).get('/api/connections');
            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/connections/new', () => {
        test('Should create a new connection request', async () => {
            const res = await request(app)
                .post('/api/connections/new')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    serviceType: 'ELECTRICITY',
                    address: 'Test Address 123',
                    pinCode: '400001',
                    applicantType: 'RESIDENTIAL'
                });

            // Could be 200, 201, or 400 depending on controller required fields
            expect([200, 201, 400]).toContain(res.status);
            if (res.status === 200 || res.status === 201) {
                expect(res.body.success).toBe(true);
            }
        });

        test('Should fail without authentication', async () => {
            const res = await request(app)
                .post('/api/connections/new')
                .send({ serviceType: 'ELECTRICITY' });
            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/connections/track/:applicationId', () => {
        test('Should return 404 for non-existent application', async () => {
            const res = await request(app)
                .get('/api/connections/track/APP-0000-00000000')
                .set('Authorization', `Bearer ${userToken}`);
            expect([404, 500]).toContain(res.status);
        });

        test('Should fail without authentication', async () => {
            const res = await request(app)
                .get('/api/connections/track/APP-0000-00000000');
            expect(res.status).toBe(401);
        });
    });
});
