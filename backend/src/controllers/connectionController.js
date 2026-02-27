const prisma = require('../utils/prismaClient');
const crypto = require('crypto');
// Similar structure for new connections, transfers, etc.
// Request new connection
exports.requestNewConnection = async (req, res) => {
    try {
        let {
            serviceType,
            applicantName,
            mobileNumber,
            email,
            address,
            city,
            state,
            pincode,
            connectionType,
            serviceDetails
        } = req.body;

        // Fallback to Citizen profile for missing PII (essential for offline-synced requests)
        if (!mobileNumber || !email || !applicantName) {
            // Security: If payload specifies an owner hash, it must match current token
            if (req.body.aadharHash && req.body.aadharHash !== req.user.aadharHash) {
                return res.status(403).json({
                    success: false,
                    message: "Attribution mismatch: Queued request does not belong to current session."
                });
            }

            const citizen = await prisma.citizen.findUnique({
                where: { aadharNumber: req.user.citizenId }
            });
            if (citizen) {
                if (!mobileNumber) mobileNumber = citizen.mobileNumber;
                if (!email) email = citizen.email;
                if (!applicantName) applicantName = citizen.fullName;
            }
        }

        // Basic validation
        const missingFields = [];
        if (!serviceType) missingFields.push('serviceType');
        if (!applicantName) missingFields.push('applicantName');
        if (!mobileNumber) missingFields.push('mobileNumber');
        if (!address) missingFields.push('address');
        if (!city) missingFields.push('city');
        if (!state) missingFields.push('state');
        if (!pincode) missingFields.push('pincode');
        if (!connectionType) missingFields.push('connectionType');

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`,
                missingFields
            });
        }

        // Generate collision-proof application ID using UUID v4
        // Format: APP-YYYY-XXXXXXXX (e.g., APP-2026-a1b2c3d4e5f6g7h8)
        const year = new Date().getFullYear();
        const uuidPart = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
        const applicationId = `APP-${year}-${uuidPart}`;

        // Create Connection Application
        const newApplication = await prisma.connectionApplication.create({
            data: {
                applicationId,
                citizenId: req.user.citizenId,
                serviceType: serviceType.toUpperCase(),
                applicantName,
                mobileNumber,
                email,
                address,
                city,
                state,
                pincode,
                connectionType,
                serviceDetails: serviceDetails || {},
                status: 'PENDING'
            }
        });

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            applicationId,
            id: newApplication.id
        });

    } catch (error) {
        console.error('New connection request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit application'
        });
    }
};

// Track connection status
exports.trackConnectionStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;

        // Find connection application by applicationId
        const application = await prisma.connectionApplication.findUnique({
            where: {
                applicationId: applicationId
            },
            include: {
                citizen: {
                    select: {
                        fullName: true,
                        mobileNumber: true
                    }
                }
            }
        });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Verify ownership authorization
        if (!req.user || req.user.citizenId !== application.citizenId) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You do not have permission to view this application'
            });
        }

        res.json({
            success: true,
            status: application.status,
            application: {
                applicationId: application.applicationId,
                status: application.status,
                applicantName: application.applicantName,
                mobileNumber: application.mobileNumber,
                email: application.email,
                address: application.address,
                city: application.city,
                state: application.state,
                pincode: application.pincode,
                connectionType: application.connectionType,
                serviceType: application.serviceType,
                createdAt: application.createdAt,
                updatedAt: application.updatedAt,
                department: application.serviceType,
                reviewNotes: application.reviewNotes,
                rejectionReason: application.rejectionReason,
                timeline: [
                    { status: 'SUBMITTED', date: application.createdAt, notes: 'Application Received' },
                    ...(application.status === 'VERIFICATION' ? [{ status: 'VERIFICATION', date: application.updatedAt, notes: 'Under Verification' }] : []),
                    ...(application.status === 'APPROVED' ? [{ status: 'APPROVED', date: application.updatedAt, notes: 'Application Approved' }] : []),
                    ...(application.status === 'REJECTED' ? [{ status: 'REJECTED', date: application.updatedAt, notes: application.rejectionReason || 'Application Rejected' }] : [])
                ]
            }
        });

    } catch (error) {
        console.error('Track connection error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track application'
        });
    }
};

// Get my connection applications
exports.getMyApplications = async (req, res) => {
    try {
        const { citizenId } = req.user;
        const { serviceType } = req.query;

        const where = {
            citizenId
        };

        if (serviceType) {
            where.serviceType = serviceType.toUpperCase();
        }

        const applications = await prisma.connectionApplication.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                applicationId: true,
                serviceType: true,
                status: true,
                createdAt: true,
                updatedAt: true
            }
        });

        res.json({
            success: true,
            applications
        });

    } catch (error) {
        console.error('Get my applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch applications'
        });
    }
};
