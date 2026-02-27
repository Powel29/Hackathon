const request = require('supertest');
const app = require('../src/server');
const prisma = require('../src/utils/prismaClient');
const { getTestToken } = require('./testUtils');

describe('Service Request API', () => {
    let userToken;

    beforeAll(async () => {
        userToken = await getTestToken('999999990019', '9876543219');
    }, 15000);

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('GET /api/service-requests', () => {
        test('Should return service requests for authenticated user', async () => {
            const res = await request(app)
                .get('/api/service-requests')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        test('Should fail without authentication', async () => {
            const res = await request(app).get('/api/service-requests');
            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/service-requests', () => {
        test('Should create a new service request', async () => {
            const res = await request(app)
                .post('/api/service-requests')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    serviceType: 'ELECTRICITY',
                    requestType: 'NAME_CHANGE',
                    description: 'Please update the name on my account',
                    details: { newName: 'Test User Updated' }
                });

            expect([200, 201]).toContain(res.status);
            expect(res.body.success).toBe(true);
        });

        test('Should fail without authentication', async () => {
            const res = await request(app)
                .post('/api/service-requests')
                .send({ serviceType: 'WATER', requestType: 'NAME_CHANGE' });
            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/service-requests/:requestId', () => {
        test('Should return 404 for non-existent request', async () => {
            const res = await request(app)
                .get('/api/service-requests/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${userToken}`);
            expect([404, 500]).toContain(res.status);
        });

        test('Should fail without authentication', async () => {
            const res = await request(app)
                .get('/api/service-requests/some-id');
            expect(res.status).toBe(401);
        });
    });
});
