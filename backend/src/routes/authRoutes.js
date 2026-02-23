const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { verifyToken, logout } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateRequest');
const rateLimit = require("express-rate-limit");

const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3, // Limit each IP to 3 OTP requests per windowMs
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT',
            message: 'Too many OTP requests from this IP, please try again after 10 minutes'
        }
    }
});

// Initiate Auth (Send OTP)
router.post(
    '/initiate',
    otpLimiter,
    [
        body('aadharNumber')
            .trim()
            .isLength({ min: 12, max: 12 })
            .withMessage('Aadhaar must be exactly 12 digits')
            .isNumeric()
            .withMessage('Aadhaar must contain only numbers'),
        body('mobileNumber')
            .optional()
            .trim()
            .isLength({ min: 10, max: 10 })
            .withMessage('Mobile must be exactly 10 digits')
            .isNumeric()
            .withMessage('Mobile must contain only numbers')
    ],
    validate,
    authController.initiateAuth
);

// Verify OTP
router.post(
    '/verify-otp',
    [
        body('aadharNumber')
            .trim()
            .isLength({ min: 12, max: 12 })
            .isNumeric(),
        body('otp')
            .trim()
            .isLength({ min: 6, max: 6 })
            .withMessage('OTP must be exactly 6 digits')
            .isNumeric()
            .withMessage('OTP must contain only numbers')
    ],
    validate,
    authController.verifyOTP
);

// Resend OTP
router.post(
    '/resend-otp',
    otpLimiter,
    [
        body('aadharNumber')
            .trim()
            .isLength({ min: 12, max: 12 })
            .isNumeric()
    ],
    validate,
    authController.resendOTP
);

// Logout
router.post('/logout', verifyToken, logout);

// Health Check
router.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

module.exports = router;