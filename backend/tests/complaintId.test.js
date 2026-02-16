const request = require('supertest');
const app = require('../src/server');

describe('Complaint ID Verification', () => {
    let userToken;
    const testAadhaar = '999999990019';
    const testMobile = '9876543219';
    let complaintNumber;
    let internalId;

    beforeAll(async () => {
        // 1. Login
        const initRes = await request(app)
            .post('/api/auth/initiate')
            .send({
                aadharNumber: testAadhaar,
                mobileNumber: testMobile
            });

        const otp = initRes.body._demoOTP;

        const verifyRes = await request(app)
            .post('/api/auth/verify-otp')
            .send({
                aadharNumber: testAadhaar,
                otp: otp
            });

        userToken = verifyRes.body.token;
    });

    test('Register Complaint returns CMP- ID', async () => {
        const res = await request(app)
            .post('/api/complaints')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                serviceType: 'ELECTRICITY',
                complaintType: 'POWER_OUTAGE',
                title: 'Test Power Outage',
                description: 'Testing readable ID generation',
                location: 'Test Location'
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.complaint.complaintId).toMatch(/^CMP-\d{4}-[A-F0-9]{8}$/i);

        complaintNumber = res.body.complaint.complaintId;
        internalId = res.body.complaintInternalId;
    });

    test('Track Complaint by Readable ID', async () => {
        const res = await request(app)
            .get(`/api/complaints/track/${complaintNumber}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.complaint.complaintId).toBe(complaintNumber);
        expect(res.body.complaint.originalId).toBeDefined();
    });

    test('Get Complaint Details by Readable ID', async () => {
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
        const myComplaint = res.body.complaints.find(c => c.complaintId === complaintNumber || c.originalId === internalId);
        expect(myComplaint).toBeDefined();
        expect(myComplaint.complaintId).toBe(complaintNumber);
    });
});
