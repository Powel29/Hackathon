<<<<<<< Updated upstream
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
=======
const prisma = require('../config/prisma');
const crypto = require('crypto');
// Complaint type definitions
const COMPLAINT_TYPES = {
    ELECTRICITY: [
        'POWER_OUTAGE',
        'VOLTAGE_FLUCTUATION',
        'BILLING_ISSUE',
        'METER_MALFUNCTION',
        'STREET_LIGHT',
        'WIRE_DAMAGE',
        'OTHER'
    ],
    GAS: [
        'GAS_LEAK',
        'LOW_PRESSURE',
        'BILLING_ISSUE',
        'METER_PROBLEM',
        'SUPPLY_DISRUPTION',
        'PIPE_DAMAGE',
        'OTHER'
    ],
    WATER: [
        'NO_WATER_SUPPLY',
        'LOW_PRESSURE',
        'WATER_CONTAMINATION',
        'BILLING_ISSUE',
        'PIPE_LEAKAGE',
        'DRAINAGE_BLOCKAGE',
        'OTHER'
    ],
    MUNICIPAL: [
        'GARBAGE_COLLECTION',
        'STREET_LIGHT',
        'ROAD_DAMAGE',
        'DRAINAGE_ISSUE',
        'PARK_MAINTENANCE',
        'STRAY_ANIMALS',
        'OTHER'
    ]
};
>>>>>>> Stashed changes

// Submit complaint
exports.submitComplaint = async (req, res) => {
    try {
        const { complaintType, description, utilityType, attachments } = req.body;

        const complaint = await prisma.complaint.create({
            data: {
                userId: req.user.userId,
                complaintType,
                description,
                utilityType,
                status: 'OPEN',
                priority: 'MEDIUM',
                attachments: attachments || []
            }
        });

        res.json({
            success: true,
            message: 'Complaint submitted successfully',
            complaint
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Track complaint
exports.trackComplaint = async (req, res) => {
    try {
        const { id } = req.params;

        const complaint = await prisma.complaint.findUnique({
            where: { id },
            include: { user: { select: { name: true, mobile: true } } }
        });

        res.json({ success: true, complaint });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};