const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

<<<<<<< Updated upstream
const prisma = new PrismaClient();
=======
const prisma = require('../config/prisma');
>>>>>>> Stashed changes

// Authenticate user by Consumer ID or Mobile
exports.login = async (req, res) => {
    try {
        const { consumerId, mobile, utilityType } = req.body;

        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { consumerId: consumerId },
                    { mobile: mobile }
                ],
                utilityType: utilityType
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const token = jwt.sign(
            { userId: user.id, utilityType: user.utilityType },
            process.env.JWT_SECRET,
            { expiresIn: '30m' } // Short session for kiosk
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                consumerId: user.consumerId,
                utilityType: user.utilityType
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// OTP-based verification (simplified)
exports.sendOTP = async (req, res) => {
    // Implement OTP sending logic
    // Use SMS gateway or mock for demo
};

exports.verifyOTP = async (req, res) => {
    // Implement OTP verification
};