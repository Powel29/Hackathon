const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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