const request = require('supertest');
const app = require('../src/server');
const prisma = require('../src/utils/prismaClient');
const { getTestToken, cleanDB } = require('./testUtils');

describe('Complaint ID Verification', () => {
    let userToken;
    const testAadhaar = '999999990019';
    const testMobile = '9876543219';
    let complaintNumber;
    let internalId;

    beforeAll(async () => {
        userToken = await getTestToken(testAadhaar, testMobile);
    }, 15000);

    afterAll(async () => {
        await prisma.$disconnect();
    });

    test('Register Complaint returns CMP- ID', async () => {
        const res = await request(app)
            .post('/api/complaints')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                serviceType: 'ELECTRICITY',
                complaintType: 'POWER_OUTAGE',
                title: 'Test Power Outage',
                description: 'Testing readable ID generation for complaint system',
                location: 'Test Location'
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.complaint.complaintId).toMatch(/^CMP-\d{4}-[A-F0-9]{8}$/i);

        complaintNumber = res.body.complaint.complaintId;
        internalId = res.body.complaintInternalId;
    });

    test('Track Complaint by Readable ID', async () => {
        if (!complaintNumber) return;
        const res = await request(app)
            .get(`/api/complaints/track/${complaintNumber}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.complaint.complaintId).toBe(complaintNumber);
        expect(res.body.complaint.originalId).toBeDefined();
    });

    test('Get Complaint Details by Readable ID', async () => {
        if (!complaintNumber) return;
        const res = await request(app)
            .get(`/api/complaints/${complaintNumber}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.complaint.complaintId).toBe(complaintNumber);
    });

    test('Get My Complaints returns Readable IDs', async () => {
        const res = await request(app)
            .get('/api/complaints')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        if (complaintNumber) {
            const myComplaint = res.body.complaints.find(c => c.complaintId === complaintNumber || c.originalId === internalId);
            expect(myComplaint).toBeDefined();
            expect(myComplaint.complaintId).toBe(complaintNumber);
        }
    });
});
