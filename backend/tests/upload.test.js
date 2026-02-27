const request = require('supertest');
const app = require('../src/server');
const prisma = require('../src/utils/prismaClient');

describe('Upload API', () => {
    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('POST /api/upload', () => {
        test('Should fail without file', async () => {
            const res = await request(app)
                .post('/api/upload')
                .field('citizenId', 'test-citizen')
                .field('relatedEntity', 'complaint')
                .field('relatedId', 'test-id')
                .field('documentType', 'PHOTO');

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('No file uploaded');
        });

        test('Should fail without required metadata', async () => {
            const res = await request(app)
                .post('/api/upload')
                .attach('file', Buffer.from('test file content'), 'test.txt');

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });
});
