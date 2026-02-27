const request = require('supertest');
const app = require('../src/server');
const prisma = require('../src/utils/prismaClient');

describe('Document API', () => {
    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('GET /api/documents/related/:relatedId', () => {
        test('Should return empty array for non-existent relatedId', async () => {
            const res = await request(app)
                .get('/api/documents/related/nonexistent-id');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.documents).toEqual([]);
        });

        test('Should handle APP- prefixed IDs', async () => {
            const res = await request(app)
                .get('/api/documents/related/APP-0000-00000000');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.documents).toEqual([]);
        });

        test('Should handle CMP- prefixed IDs', async () => {
            const res = await request(app)
                .get('/api/documents/related/CMP-0000-00000000');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.documents).toEqual([]);
        });
    });

    describe('GET /api/documents/citizen/:citizenId', () => {
        test('Should return empty array for citizen with no documents', async () => {
            const res = await request(app)
                .get('/api/documents/citizen/nonexistent-citizen');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.documents).toEqual([]);
        });

        test('Should filter by department if provided', async () => {
            const res = await request(app)
                .get('/api/documents/citizen/test-citizen?department=ELECTRICITY');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });

    describe('GET /api/documents/:documentId', () => {
        test('Should return 404 for non-existent document', async () => {
            const res = await request(app)
                .get('/api/documents/00000000-0000-0000-0000-000000000000');

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.error.code).toBe('NOT_FOUND');
        });
    });
});
