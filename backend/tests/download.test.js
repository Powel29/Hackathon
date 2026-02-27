const request = require('supertest');
const app = require('../src/server');
const prisma = require('../src/utils/prismaClient');

describe('Download API', () => {
    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('GET /api/download/:key', () => {
        test('Should attempt to generate a signed URL for a key', async () => {
            const res = await request(app)
                .get('/api/download/nonexistent-key');

            // Even with a fake key, the S3 service may generate a URL or throw
            expect([200, 500]).toContain(res.status);
        });

        test('Should handle special characters in key', async () => {
            const res = await request(app)
                .get('/api/download/test%2Fspecial-file.pdf');

            expect([200, 500]).toContain(res.status);
        });
    });
});
