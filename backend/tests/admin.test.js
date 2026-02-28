const request = require('supertest');
const app = require('../src/server');
const prisma = require('../src/utils/prismaClient');
const bcrypt = require('bcryptjs');

describe('Admin API', () => {
    let adminToken;
    beforeAll(async () => {
        // Create a mock admin for testing
        const hash = await bcrypt.hash('correct_password', 10);
        await prisma.admin.upsert({
            where: { departmentId: 'TEST_DEPT_001' },
            update: { passwordHash: hash },
            create: {
                departmentId: 'TEST_DEPT_001',
                name: 'Test Admin',
                email: 'testadmin@example.com',
                passwordHash: hash,
                department: 'TEST',
                role: 'ADMIN'
            }
        });
    });

    afterAll(async () => {
        // Clean up mock admin
        await prisma.admin.deleteMany({ where: { departmentId: 'TEST_DEPT_001' } }).catch(() => { });
        await prisma.$disconnect();
    });

    describe('POST /api/admin/login', () => {
        test('Should succeed with valid credentials', async () => {
            const res = await request(app)
                .post('/api/admin/login')
                .send({ deptId: 'TEST_DEPT_001', password: 'correct_password' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
            expect(res.body.user).toBeDefined();
            expect(res.body.user.departmentId).toBe('TEST_DEPT_001');
            expect(res.body.user.passwordHash).toBeUndefined(); // Should not return passwordHash

            adminToken = res.body.token;
        });

        test('Should fail with missing credentials', async () => {
            const res = await request(app)
                .post('/api/admin/login')
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        test('Should fail with invalid credentials', async () => {
            const res = await request(app)
                .post('/api/admin/login')
                .send({ deptId: 'FAKE_DEPT', password: 'wrong_password' });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        test('Should fail with missing password', async () => {
            const res = await request(app)
                .post('/api/admin/login')
                .send({ deptId: 'SOME_DEPT' });

            expect(res.status).toBe(400);
        });
    });

    describe('Protected Admin Routes (without token)', () => {
        test('GET /api/admin/complaints should fail without auth', async () => {
            const res = await request(app).get('/api/admin/complaints');
            expect(res.status).toBe(401);
        });

        test('GET /api/admin/connections should fail without auth', async () => {
            const res = await request(app).get('/api/admin/connections');
            expect(res.status).toBe(401);
        });

        test('GET /api/admin/bills should fail without auth', async () => {
            const res = await request(app).get('/api/admin/bills');
            expect(res.status).toBe(401);
        });

        test('GET /api/admin/requests should fail without auth', async () => {
            const res = await request(app).get('/api/admin/requests');
            expect(res.status).toBe(401);
        });

        test('GET /api/admin/alerts should fail without auth', async () => {
            const res = await request(app).get('/api/admin/alerts');
            expect(res.status).toBe(401);
        });

        test('GET /api/admin/kiosks should fail without auth', async () => {
            const res = await request(app).get('/api/admin/kiosks');
            expect(res.status).toBe(401);
        });

        test('GET /api/admin/citizens/search should fail without auth', async () => {
            const res = await request(app).get('/api/admin/citizens/search');
            expect(res.status).toBe(401);
        });

        test('GET /api/admin/account-requests should fail without auth', async () => {
            const res = await request(app).get('/api/admin/account-requests');
            expect(res.status).toBe(401);
        });
    });

    describe('Protected Admin Routes (with invalid token)', () => {
        test('GET /api/admin/complaints should fail with invalid token', async () => {
            const res = await request(app)
                .get('/api/admin/complaints')
                .set('Authorization', 'Bearer fake_token');
            expect(res.status).toBe(403);
        });

        test('PUT /api/admin/complaints/:id should fail with invalid token', async () => {
            const res = await request(app)
                .put('/api/admin/complaints/some-id')
                .set('Authorization', 'Bearer fake_token')
                .send({ status: 'RESOLVED' });
            expect(res.status).toBe(403);
        });

        test('POST /api/admin/bills should fail with invalid token', async () => {
            const res = await request(app)
                .post('/api/admin/bills')
                .set('Authorization', 'Bearer fake_token')
                .send({});
            expect(res.status).toBe(403);
        });
    });

    describe('Protected Admin Routes (with valid token)', () => {
        // Complaints routes
        test('GET /api/admin/complaints should succeed', async () => {
            const res = await request(app).get('/api/admin/complaints').set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
        });

        test('PUT /api/admin/complaints/:id should succeed/handle gracefully', async () => {
            const res = await request(app)
                .put('/api/admin/complaints/fake-id')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'RESOLVED' });
            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
        });

        // Citizens routes
        test('GET /api/admin/citizens/search should succeed', async () => {
            const res = await request(app).get('/api/admin/citizens/search?q=test').set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
        });

        // Connections routes
        test('GET /api/admin/connections should succeed', async () => {
            const res = await request(app).get('/api/admin/connections').set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
        });

        test('PUT /api/admin/connections/:id should succeed/handle gracefully', async () => {
            const res = await request(app)
                .put('/api/admin/connections/fake-id')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'APPROVED' });
            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
        });

        // Bills routes
        test('GET /api/admin/bills should succeed', async () => {
            const res = await request(app).get('/api/admin/bills').set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
        });

        test('POST /api/admin/bills should handle cleanly', async () => {
            const res = await request(app)
                .post('/api/admin/bills')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ citizenId: '123', serviceType: 'water', amount: 100, dueDate: '2025-01-01' });
            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
        });

        test('PUT /api/admin/bills/:id should handle cleanly', async () => {
            const res = await request(app)
                .put('/api/admin/bills/fake-id')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'paid', serviceType: 'water' });
            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
        });

        // Service Requests routes
        test('GET /api/admin/requests should succeed', async () => {
            const res = await request(app).get('/api/admin/requests').set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
        });

        test('PUT /api/admin/requests/:id should handle cleanly', async () => {
            const res = await request(app)
                .put('/api/admin/requests/fake-id')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ status: 'RESOLVED' });
            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
        });

        // Account Approval routes
        test('GET /api/admin/account-requests should succeed', async () => {
            const res = await request(app).get('/api/admin/account-requests').set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
        });

        test('POST /api/admin/account-requests/:id/approve should handle cleanly', async () => {
            const res = await request(app)
                .post('/api/admin/account-requests/fake-id/approve')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ adminNotes: 'Approved' });
            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
        });

        test('POST /api/admin/account-requests/:id/reject should handle cleanly', async () => {
            const res = await request(app)
                .post('/api/admin/account-requests/fake-id/reject')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ adminNotes: 'Rejected' });
            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
        });

        // Alerts routes
        test('GET /api/admin/alerts should succeed', async () => {
            const res = await request(app).get('/api/admin/alerts').set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
        });

        test('POST /api/admin/alerts should handle cleanly', async () => {
            const res = await request(app)
                .post('/api/admin/alerts')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ title: 'Test Alert', content: 'Alert msg', type: 'INFO', serviceType: 'all' });
            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
        });

        test('PUT /api/admin/alerts/:id should handle cleanly', async () => {
            const res = await request(app)
                .put('/api/admin/alerts/fake-id')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ active: false });
            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
        });

        test('DELETE /api/admin/alerts/:id should handle cleanly', async () => {
            const res = await request(app)
                .delete('/api/admin/alerts/fake-id')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
        });

        // Kiosk Monitoring routes
        test('GET /api/admin/kiosks should succeed', async () => {
            const res = await request(app).get('/api/admin/kiosks').set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).not.toBe(401);
            expect(res.status).not.toBe(403);
        });
    });
});
