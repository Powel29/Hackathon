const request = require('supertest');
const app = require('../src/server');
const prisma = require('../src/utils/prismaClient');
const { hashAadhaar } = require('../src/utils/aadhaarValidator');

/**
 * Clean up all DB records associated with a test Aadhaar/Mobile pair.
 */
async function cleanDB(testAadhaar, testMobile) {
    const aadharHash = hashAadhaar(testAadhaar);
    // Delete in correct FK order
    await prisma.serviceAccount.deleteMany({ where: { citizenId: testAadhaar } }).catch(() => { });
    await prisma.authSession.deleteMany({ where: { citizenId: testAadhaar } }).catch(() => { });
    await prisma.oTPVerification.deleteMany({ where: { mobileNumber: testMobile } }).catch(() => { });
    await prisma.oTPVerification.deleteMany({ where: { citizenId: testAadhaar } }).catch(() => { });
    await prisma.auditLog.deleteMany({ where: { citizenId: testAadhaar } }).catch(() => { });
    await prisma.kioskLog.deleteMany({ where: { citizenId: testAadhaar } }).catch(() => { });
    await prisma.complaint.deleteMany({ where: { citizenId: testAadhaar } }).catch(() => { });
    await prisma.connectionApplication.deleteMany({ where: { citizenId: testAadhaar } }).catch(() => { });
    await prisma.serviceRequest.deleteMany({ where: { citizenId: testAadhaar } }).catch(() => { });
    await prisma.citizen.deleteMany({ where: { aadharHash } }).catch(() => { });
    await prisma.citizen.deleteMany({ where: { mobileNumber: testMobile } }).catch(() => { });
}

/**
 * Get a valid JWT token for a test citizen using the Firebase bypass.
 */
async function getTestToken(testAadhaar = '999999990019', testMobile = '9876543219') {
    await cleanDB(testAadhaar, testMobile);

    const verifyRes = await request(app)
        .post('/api/auth/verify-otp')
        .send({
            aadharNumber: testAadhaar,
            otp: '000000',
            mobileNumber: testMobile,
            firebaseVerified: true,
            userData: {
                fullName: 'Test User',
                dateOfBirth: '1990-01-01',
                gender: 'M',
                address: 'Test Address'
            }
        });

    if (verifyRes.status !== 200 || !verifyRes.body.token) {
        throw new Error(`Failed to get test token: ${JSON.stringify(verifyRes.body)}`);
    }
    return verifyRes.body.token;
}

module.exports = { cleanDB, getTestToken };
