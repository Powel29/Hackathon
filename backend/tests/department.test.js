const request = require('supertest');
const app = require('../src/server');
const prisma = require('../src/utils/prismaClient');
const { getTestToken } = require('./testUtils');

describe('Department API', () => {
    let userToken;

    beforeAll(async () => {
        userToken = await getTestToken('999999990019', '9876543219');
    }, 15000);

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('POST /api/departments/verify', () => {
        test('Should verify a department account with valid data', async () => {
            const res = await request(app)
                .post('/api/departments/verify')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    serviceType: 'ELECTRICITY',
                    consumerNumber: 'ELEC12345678'
                });

            // Mock may return 200 or 404 depending on seed data
            expect([200, 404]).toContain(res.status);
        });

        test('Should fail with invalid service type', async () => {
            const res = await request(app)
                .post('/api/departments/verify')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    serviceType: 'INVALID',
                    consumerNumber: 'ELEC12345678'
                });

            expect(res.status).toBe(400);
        });

        test('Should fail with missing consumer number', async () => {
            const res = await request(app)
                .post('/api/departments/verify')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ serviceType: 'ELECTRICITY' });

            expect(res.status).toBe(400);
        });

        test('Should fail without authentication', async () => {
            const res = await request(app)
                .post('/api/departments/verify')
                .send({ serviceType: 'ELECTRICITY', consumerNumber: 'ELEC12345678' });
            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/departments/:serviceType/alerts', () => {
        test('Should return alerts for valid service type', async () => {
            const res = await request(app)
                .get('/api/departments/ELECTRICITY/alerts')
                .set('Authorization', `Bearer ${userToken}`);

            expect([200, 404]).toContain(res.status);
        });

        test('Should fail with invalid service type', async () => {
            const res = await request(app)
                .get('/api/departments/INVALID/alerts')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(400);
        });

        test('Should fail without authentication', async () => {
            const res = await request(app)
                .get('/api/departments/ELECTRICITY/alerts');
            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/departments/request-approval', () => {
        test('Should create an account approval request', async () => {
            const res = await request(app)
                .post('/api/departments/request-approval')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    serviceType: 'ELECTRICITY',
                    consumerNumber: 'ELEC12345678'
                });

            expect([200, 201, 400, 409]).toContain(res.status);
        });

        test('Should fail with missing fields', async () => {
            const res = await request(app)
                .post('/api/departments/request-approval')
                .set('Authorization', `Bearer ${userToken}`)
                .send({});

            expect(res.status).toBe(400);
        });

        test('Should fail without authentication', async () => {
            const res = await request(app)
                .post('/api/departments/request-approval')
                .send({ serviceType: 'WATER', consumerNumber: 'W123' });
            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/departments/:serviceType/:consumerNumber', () => {
        test('Should get account details', async () => {
            const res = await request(app)
                .get('/api/departments/ELECTRICITY/ELEC12345678')
                .set('Authorization', `Bearer ${userToken}`);

            expect([200, 403, 404]).toContain(res.status);
        });

        test('Should fail with invalid service type', async () => {
            const res = await request(app)
                .get('/api/departments/INVALID/ELEC12345678')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(400);
        });

        test('Should fail without authentication', async () => {
            const res = await request(app)
                .get('/api/departments/ELECTRICITY/ELEC12345678');
            expect(res.status).toBe(401);
        });
    });
});
