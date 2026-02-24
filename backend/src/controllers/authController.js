const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { validateAadhaar, hashAadhaar, maskAadhaar } = require('../utils/aadhaarValidator');
const { mockAadhaarFetch } = require('../services/aadhaarService');
const { sendOTP: otpServiceSend, verifyOTP: otpServiceVerify } = require('../services/otpService');

const prisma = require('../utils/prismaClient');

/**
 * Helper: Hashing for OTP-like data
 */
const hashOTP = (otp) => {
    return crypto.createHash('sha256').update(otp + (process.env.OTP_SALT || 'suvidha_salt')).digest('hex');
};

/**
 * STEP 1: Initiate Authentication
 * POST /api/auth/initiate
 * Body: { aadharNumber, mobileNumber? }
 */
exports.initiateAuth = async (req, res) => {
    try {
        const { aadharNumber, mobileNumber } = req.body;

        // Validate Aadhaar format
        if (!validateAadhaar(aadharNumber)) {
            await logAudit(null, 'AADHAAR_INVALID', req, { aadharNumber: maskAadhaar(aadharNumber) });

            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_AADHAAR',
                    message: 'Please enter a valid 12-digit Aadhaar number',
                    field: 'aadharNumber'
                }
            });
        }

        const aadharHash = hashAadhaar(aadharNumber);

        // Check if citizen exists
        const existingCitizen = await prisma.citizen.findUnique({
            where: { aadharHash },
            select: {
                aadharNumber: true,
                fullName: true,
                mobileNumber: true,
                isVerified: true,
                isActive: true
            }
        });

        const isNewUser = !existingCitizen;
        let targetMobile;

        if (isNewUser) {
            // NEW USER: Validate mobile number
            if (!mobileNumber || !/^[6-9]\d{9}$/.test(mobileNumber)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'MOBILE_REQUIRED',
                        message: 'Please enter a valid 10-digit mobile number starting with 6-9',
                        field: 'mobileNumber'
                    }
                });
            }

            // Check if mobile already registered
            const mobileExists = await prisma.citizen.findUnique({
                where: { mobileNumber }
            });

            if (mobileExists) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'MOBILE_EXISTS',
                        message: 'This mobile number is already registered with another Aadhaar'
                    }
                });
            }

            targetMobile = mobileNumber;
        } else {
            // EXISTING USER: Check if active
            if (!existingCitizen.isActive) {
                return res.status(403).json({
                    success: false,
                    error: {
                        code: 'ACCOUNT_INACTIVE',
                        message: 'Your account is inactive. Please contact support'
                    }
                });
            }

            targetMobile = existingCitizen.mobileNumber;
        }

        console.log(`[AUTH] User Lookup: Aadhaar=${aadharNumber}, Found=${!!existingCitizen}, Mobile=${targetMobile}`);

        // Rate Limiting: Max 3 OTPs per hour per Aadhaar (Skip in development)
        if (process.env.NODE_ENV !== 'development') {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const recentOTPs = await prisma.oTPVerification.count({
                where: isNewUser ? {
                    mobileNumber: targetMobile,
                    createdAt: { gte: oneHourAgo }
                } : {
                    citizenId: existingCitizen.aadharNumber,
                    createdAt: { gte: oneHourAgo }
                }
            });

            if (recentOTPs >= 3) {
                await logAudit(
                    existingCitizen?.aadharNumber,
                    'OTP_RATE_LIMIT',
                    req,
                    { count: recentOTPs }
                );

                return res.status(429).json({
                    success: false,
                    error: {
                        code: 'RATE_LIMIT',
                        message: 'Too many OTP requests. Please try after 1 hour'
                    }
                });
            }
        }

        // Generate dynamic OTP for development simulation
        let devOTP;
        let otpHashToStore;

        if (process.env.NODE_ENV === 'development') {
            devOTP = Math.floor(100000 + Math.random() * 900000).toString();
            otpHashToStore = hashOTP(devOTP);
        } else {
            // Use a placeholder as Twilio handles verify logic in production
            otpHashToStore = `TWILIO_VERIFY_${Date.now()}`;
        }

        // Store OTP attempt (for rate-limiting and audit purposes)
        await prisma.oTPVerification.create({
            data: {
                citizenId: isNewUser ? null : existingCitizen.aadharNumber,
                mobileNumber: targetMobile,
                otpHash: otpHashToStore,
                purpose: isNewUser ? 'SIGNUP' : 'LOGIN',
                expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
            }
        });

        // ==================================================================================
        // CRITICAL: OTP SENDING LOGIC
        // AI AGENTS: DO NOT REMOVE THE PRODUCTION BLOCK OR THE CONDITIONAL CHECK.
        // real SMS costs money. In development, we use log simulation.
        // ==================================================================================
        if (process.env.NODE_ENV === 'production') {
            // PRODUCTION MODE: Send real SMS via Twilio Verify
            try {
                await otpServiceSend(targetMobile);
                console.log(`✅ [PROD] Real OTP request sent for ${targetMobile}`);
            } catch (twilioErr) {
                console.error(`❌ [PROD] Twilio real SMS failed: ${twilioErr.message}`);
                throw twilioErr;
            }
        } else {
            // DEVELOPMENT MODE: Log to terminal only (Save costs/credits)
            console.log(' ');
            console.log('=========================================================');
            console.log(`👷 [DEV MODE] Dynamic OTP generated for ${targetMobile}`);
            console.log(`👉 VERIFICATION CODE: ${devOTP}`);
            console.log('=========================================================');
            console.log(' ');
        }

        await logAudit(
            existingCitizen?.aadharNumber,
            'OTP_SENT',
            req,
            { isNewUser, mobile: targetMobile.slice(-4) }
        );

        res.json({
            success: true,
            isNewUser,
            maskedMobile: targetMobile ? targetMobile.replace(/\d(?=\d{4})/g, '*') : undefined,
            mobileNumber: targetMobile,
            maskedAadhaar: maskAadhaar(aadharNumber),
            expiresIn: 300,
            _demoOTP: (process.env.NODE_ENV === 'development') ? devOTP : undefined
        });

    } catch (error) {
        console.error('Initiate Auth Error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Something went wrong. Please try again'
            }
        });
    }
};

/**
 * STEP 2: Verify OTP
 * POST /api/auth/verify-otp
 * Body: { aadharNumber, otp }
 */
exports.verifyOTP = async (req, res) => {
    try {
        const { aadharNumber, otp, firebaseVerified } = req.body;

        // Validate inputs
        if (!validateAadhaar(aadharNumber)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_AADHAAR',
                    message: 'Invalid Aadhaar number'
                }
            });
        }

        // HACKATHON MODE: Skip OTP verification if Firebase verified
        // WARNING: In production, verify the Firebase ID token on the server!
        if (firebaseVerified && process.env.NODE_ENV === 'development') {
            console.log('🔥 Firebase bypass mode - skipping OTP verification');

            const aadharHash = hashAadhaar(aadharNumber);
            let citizen = await prisma.citizen.findUnique({
                where: { aadharHash }
            });

            if (!citizen) {
                // For hackathon/demo performance, allow easy registration in bypass mode if user doesn't exist
                console.log('🔥 New user in Firebase bypass mode - proceeding to register');

                const { userData } = req.body;
                let fullName, dateOfBirth, gender, address;

                if (userData) {
                    fullName = userData.fullName;
                    dateOfBirth = new Date(userData.dateOfBirth);
                    gender = userData.gender;
                    address = userData.address;
                } else {
                    const aadhaarData = mockAadhaarFetch(aadharNumber);
                    fullName = aadhaarData.fullName;
                    dateOfBirth = new Date(aadhaarData.dateOfBirth);
                    gender = aadhaarData.gender;
                    address = aadhaarData.address;
                }

                citizen = await prisma.citizen.create({
                    data: {
                        aadharNumber,
                        aadharHash,
                        fullName,
                        mobileNumber: req.body.mobileNumber || `910000${aadharNumber.slice(-4)}`,
                        dateOfBirth,
                        gender,
                        address,
                        email: userData?.email || null,
                        isVerified: true,
                        lastLoginAt: new Date()
                    }
                });
                await logAudit(citizen.aadharNumber, 'USER_REGISTERED_FIREBASE', req);
            }

            // Update last login
            await prisma.citizen.update({
                where: { aadharNumber: citizen.aadharNumber },
                data: {
                    lastLoginAt: new Date(),
                    isVerified: true
                }
            });

            await logAudit(citizen.aadharNumber, 'LOGIN_SUCCESS_FIREBASE', req);

            // Generate JWT token
            const token = jwt.sign(
                {
                    citizenId: citizen.aadharNumber,
                    aadharHash: citizen.aadharHash,
                    mobile: citizen.mobileNumber
                },
                process.env.JWT_SECRET,
                { expiresIn: '30m' }
            );

            // Create session record
            const tokenHash = hashOTP(token);
            await prisma.authSession.create({
                data: {
                    citizenId: citizen.aadharNumber,
                    tokenHash,
                    kioskId: req.headers['x-kiosk-id'] || 'DEMO-KIOSK-01',
                    ipAddress: req.ip || req.headers['x-forwarded-for'],
                    userAgent: req.headers['user-agent'],
                    expiresAt: new Date(Date.now() + 30 * 60 * 1000)
                }
            });

            // Check if user has service accounts
            const serviceAccounts = await prisma.serviceAccount.findMany({
                where: { citizenId: citizen.aadharNumber },
                select: { serviceType: true, accountNumber: true }
            });

            return res.json({
                success: true,
                token,
                user: {
                    aadharNumber: citizen.aadharNumber,
                    name: citizen.fullName,
                    mobile: citizen.mobileNumber,
                    email: citizen.email,
                    languagePref: citizen.languagePref,
                    hasServiceAccounts: serviceAccounts.length > 0,
                    serviceAccounts: serviceAccounts,
                    isNewUser: serviceAccounts.length === 0
                }
            });
        }

        // Normal OTP verification flow
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_OTP',
                    message: 'OTP must be 6 digits'
                }
            });
        }

        const aadharHash = hashAadhaar(aadharNumber);

        // Find citizen (might not exist if new user)
        let citizen = await prisma.citizen.findUnique({
            where: { aadharHash }
        });

        const isNewUser = !citizen;
        const targetMobile = isNewUser ? req.body.mobileNumber : citizen.mobileNumber;

        // Check latest OTP record for this user/mobile to handle rate limiting and expiry
        const latestOTP = await prisma.oTPVerification.findFirst({
            where: isNewUser ? {
                mobileNumber: targetMobile,
                citizenId: null,
                isVerified: false
            } : {
                citizenId: citizen.aadharNumber,
                isVerified: false
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!latestOTP) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'OTP_NOT_FOUND',
                    message: 'No OTP found. Please request a new one'
                }
            });
        }

        // Check if OTP attempt is expired in DB
        if (latestOTP.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'OTP_EXPIRED',
                    message: 'OTP has expired. Please request a new one'
                }
            });
        }

        // Verify with Twilio or dev simulation
        try {
            let isValid = false;

            if (process.env.NODE_ENV === 'development') {
                // Check against dynamic dev hash stored in DB
                const inputHash = hashOTP(otp);
                if (inputHash === latestOTP.otpHash) {
                    console.log('👷 Development dynamic OTP verified');
                    isValid = true;
                }
            } else {
                // Production: Verify with Twilio
                const twilioResponse = await otpServiceVerify(targetMobile, otp);
                if (twilioResponse.status === "approved") {
                    isValid = true;
                }
            }

            if (!isValid) {
                // Increment attempts
                await prisma.oTPVerification.update({
                    where: { otpId: latestOTP.otpId },
                    data: { attempts: { increment: 1 } }
                });

                const attemptsLeft = latestOTP.maxAttempts - latestOTP.attempts - 1;

                if (attemptsLeft <= 0) {
                    await logAudit(citizen?.aadharNumber || aadharNumber, 'OTP_MAX_ATTEMPTS', req);
                    return res.status(400).json({
                        success: false,
                        error: {
                            code: 'MAX_ATTEMPTS',
                            message: 'Maximum attempts exceeded. Please request a new OTP'
                        }
                    });
                }

                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_OTP',
                        message: `Incorrect OTP. ${attemptsLeft} attempts remaining`
                    }
                });
            }
        } catch (twilioErr) {
            console.error("Twilio Verify Exception:", twilioErr);
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_OTP',
                    message: 'Incorrect or expired OTP'
                }
            });
        }

        // Mark OTP as verified locally
        await prisma.oTPVerification.update({
            where: { otpId: latestOTP.otpId },
            data: { isVerified: true }
        });

        // Create or update citizen
        if (!citizen) {
            // NEW USER: Fetch Aadhaar data (Mock) OR use provided data
            // If frontend sends userData, use that. Otherwise fall back to mock.
            const { userData } = req.body;

            let fullName, dateOfBirth, gender, address;

            if (userData) {
                // Use data from frontend registration form
                fullName = userData.fullName;
                dateOfBirth = new Date(userData.dateOfBirth);
                gender = userData.gender;
                address = userData.address;
            } else {
                // Fallback to mock fetch
                const aadhaarData = mockAadhaarFetch(aadharNumber);
                fullName = aadhaarData.fullName;
                dateOfBirth = new Date(aadhaarData.dateOfBirth);
                gender = aadhaarData.gender;
                address = aadhaarData.address;
            }

            citizen = await prisma.citizen.create({
                data: {
                    aadharNumber,
                    aadharHash,
                    fullName,
                    mobileNumber: latestOTP.mobileNumber, // read the persisted mobile number from OTP record
                    dateOfBirth,
                    gender,
                    address,
                    email: userData?.email || null, // Add email if provided
                    isVerified: true,
                    lastLoginAt: new Date()
                }
            });

            await logAudit(citizen.aadharNumber, 'USER_REGISTERED', req);
        } else {
            // EXISTING USER: Update last login
            await prisma.citizen.update({
                where: { aadharNumber: citizen.aadharNumber },
                data: {
                    lastLoginAt: new Date(),
                    isVerified: true
                }
            });

            await logAudit(citizen.aadharNumber, 'LOGIN_SUCCESS', req);
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                citizenId: citizen.aadharNumber,
                aadharHash: citizen.aadharHash,
                mobile: citizen.mobileNumber
            },
            process.env.JWT_SECRET,
            { expiresIn: '30m' } // 30 minutes for kiosk
        );

        // Create session record
        const tokenHash = hashOTP(token);
        await prisma.authSession.create({
            data: {
                citizenId: citizen.aadharNumber,
                tokenHash,
                kioskId: req.headers['x-kiosk-id'] || 'DEMO-KIOSK-01',
                ipAddress: req.ip || req.headers['x-forwarded-for'],
                userAgent: req.headers['user-agent'],
                expiresAt: new Date(Date.now() + 30 * 60 * 1000)
            }
        });

        // Check if user has service accounts
        const serviceAccounts = await prisma.serviceAccount.findMany({
            where: { citizenId: citizen.aadharNumber },
            select: { serviceType: true, accountNumber: true }
        });

        res.json({
            success: true,
            token,
            user: {
                aadharNumber: citizen.aadharNumber,
                name: citizen.fullName,
                mobile: citizen.mobileNumber,
                email: citizen.email,
                languagePref: citizen.languagePref,
                hasServiceAccounts: serviceAccounts.length > 0,
                serviceAccounts: serviceAccounts,
                isNewUser: serviceAccounts.length === 0
            }
        });

    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Something went wrong. Please try again'
            }
        });
    }
};

/**
 * STEP 3: Resend OTP
 * POST /api/auth/resend-otp
 * Body: { aadharNumber }
 */
exports.resendOTP = async (req, res) => {
    try {
        const { aadharNumber, mobileNumber } = req.body;

        if (!validateAadhaar(aadharNumber)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_AADHAAR',
                    message: 'Invalid Aadhaar number'
                }
            });
        }

        const aadharHash = hashAadhaar(aadharNumber);

        // Check cooldown (30 seconds between resends)
        const citizen = await prisma.citizen.findUnique({
            where: { aadharHash }
        });

        const citizenId = citizen?.aadharNumber;
        const targetMobile = mobileNumber || citizen?.mobileNumber;

        const latestOTP = await prisma.oTPVerification.findFirst({
            where: citizenId ? { citizenId } : { mobileNumber: targetMobile, citizenId: null },
            orderBy: { createdAt: 'desc' }
        });

        if (latestOTP && (Date.now() - latestOTP.createdAt.getTime()) < 30000) {
            const waitTime = Math.ceil((30000 - (Date.now() - latestOTP.createdAt.getTime())) / 1000);

            return res.status(429).json({
                success: false,
                error: {
                    code: 'RESEND_TOO_SOON',
                    message: `Please wait ${waitTime} seconds before requesting new OTP`
                }
            });
        }

        // Invalidate previous OTPs
        await prisma.oTPVerification.updateMany({
            where: citizenId ? {
                citizenId,
                isVerified: false
            } : {
                mobileNumber: targetMobile,
                citizenId: null,
                isVerified: false
            },
            data: { isVerified: true } // Mark as used
        });

        // Reuse initiateAuth logic
        return exports.initiateAuth(req, res);
    } catch (error) {
        console.error('Resend OTP Error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Something went wrong'
            }
        });
    }
};

/**
 * Helper: Audit Logging
 */
async function logAudit(citizenId, action, req, metadata = {}) {
    try {
        await prisma.auditLog.create({
            data: {
                citizenId,
                action,
                ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
                userAgent: req.headers['user-agent'] || 'unknown',
                metadata
            }
        });
        // Also log to KioskLog for compatibility
        if (req.headers['x-kiosk-id']) {
            await prisma.kioskLog.create({
                data: {
                    kioskId: req.headers['x-kiosk-id'],
                    citizenId,
                    action,
                    metadata
                }
            });
        }
    } catch (error) {
        console.error('Audit log error:', error);
    }
}

module.exports = exports;