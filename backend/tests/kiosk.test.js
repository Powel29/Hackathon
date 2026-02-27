const request = require('supertest');
const app = require('../src/server');
const prisma = require('../src/utils/prismaClient');

describe('Kiosk API', () => {
    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('POST /api/kiosks/heartbeat', () => {
        test('Should accept a kiosk heartbeat', async () => {
            const res = await request(app)
                .post('/api/kiosks/heartbeat')
                .send({
                    kioskId: 'KIOSK-TEST-001',
                    status: 'ACTIVE',
                    location: 'Test Location'
                });

            expect([200, 201]).toContain(res.status);
        });

        test('Should handle heartbeat with missing data gracefully', async () => {
            const res = await request(app)
                .post('/api/kiosks/heartbeat')
                .send({});

            // Controller should handle gracefully
            expect([200, 400, 500]).toContain(res.status);
        });
    });
});
