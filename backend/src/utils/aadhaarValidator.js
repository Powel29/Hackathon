const crypto = require('crypto');

// Verhoeff Algorithm Lookup Tables
const d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

const p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

// Validate AADHAAR_SALT at module load time
const aadhaarSalt = process.env.AADHAAR_SALT;
if (!aadhaarSalt || aadhaarSalt.trim() === '') {
    throw new Error(
        'FATAL: AADHAAR_SALT environment variable is not set or is empty. ' +
        'Please configure AADHAAR_SALT in your .env file for secure Aadhaar hashing'
    );
}

/**
 * Validate Aadhaar number using Verhoeff algorithm
 * @param {string} aadhaar - 12 digit Aadhaar number
 * @returns {boolean} - true if valid
 */
function validateAadhaar(aadhaar) {
    // Format check
    if (!/^\d{12}$/.test(aadhaar)) {
        return false;
    }

    // Verhoeff checksum
    let c = 0;
    const digits = aadhaar.split('').reverse().map(Number);

    for (let i = 0; i < digits.length; i++) {
        c = d[c][p[(i % 8)][digits[i]]];
    }

    return c === 0;
}

/**
 * Hash Aadhaar number for secure storage
 * @param {string} aadhaar - 12 digit Aadhaar
 * @returns {string} - SHA-256 hash
 */
function hashAadhaar(aadhaar) {
    return crypto
        .createHash('sha256')
        .update(aadhaar + aadhaarSalt)
        .digest('hex');
}

/**
 * Mask Aadhaar for display (XXXX XXXX 1234)
 * @param {string} aadhaar - 12 digit Aadhaar
 * @returns {string} - Masked Aadhaar
 */
function maskAadhaar(aadhaar) {
    return 'XXXX XXXX ' + aadhaar.slice(-4);
}

module.exports = {
    validateAadhaar,
    hashAadhaar,
    maskAadhaar
};