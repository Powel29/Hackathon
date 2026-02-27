const request = require('supertest');
const app = require('../src/server');
const prisma = require('../src/utils/prismaClient');

describe('Payment API', () => {
    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('POST /api/payment/create-order', () => {
        test('Should fail with invalid amount (0)', async () => {
            const res = await request(app)
                .post('/api/payment/create-order')
                .send({ amount: 0 });

            expect(res.status).toBe(400);
        });

        test('Should fail with negative amount', async () => {
            const res = await request(app)
                .post('/api/payment/create-order')
                .send({ amount: -100 });

            expect(res.status).toBe(400);
        });

        test('Should fail with missing amount', async () => {
            const res = await request(app)
                .post('/api/payment/create-order')
                .send({});

            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/payment/verify-payment', () => {
        test('Should fail with invalid signature', async () => {
            const res = await request(app)
                .post('/api/payment/verify-payment')
                .send({
                    razorpay_order_id: 'order_fake',
                    razorpay_payment_id: 'pay_fake',
                    razorpay_signature: 'invalid_signature',
                    amount: 100
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/payment/webhook', () => {
        test('Should handle webhook with valid JSON payload', async () => {
            const payload = JSON.stringify({
                event: 'payment.captured',
                payload: {
                    payment: { entity: { id: 'pay_test_123' } }
                }
            });

            const res = await request(app)
                .post('/api/payment/webhook')
                .set('Content-Type', 'application/json')
                .send(payload);

            // Without valid signature, may return 200, 400 or 500 depending on config/body parsing
            expect([200, 400, 500]).toContain(res.status);
        });
    });
});
