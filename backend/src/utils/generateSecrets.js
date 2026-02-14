const crypto = require('crypto');

const generateSecret = (length = 64) => {
    return crypto.randomBytes(length).toString('hex');
};

console.log('# Generated Security Keys');
console.log('# Copy these into your .env file\n');

console.log(`JWT_SECRET="${generateSecret(32)}"`);
console.log(`AADHAAR_SALT="${generateSecret(16)}"`);
console.log(`OTP_SALT="${generateSecret(16)}"`);
