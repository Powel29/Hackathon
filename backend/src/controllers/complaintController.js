const prisma = require('../utils/prismaClient');
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
        'TRANSFORMER_ISSUE',
        'NEW_METER_INSTALLATION',
        'OTHER'
    ],
    GAS: [
        'GAS_LEAK',
        'NO_GAS_SUPPLY', // Updated from SUPPLY_DISRUPTION check
        'LOW_PRESSURE', // Kept for backward compatibility
        'CYLINDER_NOT_DELIVERED',
        'BILLING_ISSUE',
        'METER_PROBLEM',
        'PIPELINE_DAMAGE', // Updated from PIPE_DAMAGE
        'REGULATOR_MALFUNCTION',
        'SAFETY_INSPECTION',
        'OTHER'
    ],
    WATER: [
        'NO_WATER_SUPPLY',
        'LOW_WATER_PRESSURE', // Updated from LOW_PRESSURE
        'CONTAMINATED_WATER', // Updated from WATER_CONTAMINATION
        'BILLING_ISSUE',
        'PIPELINE_LEAKAGE', // Updated from PIPE_LEAKAGE
        'DRAINAGE_BLOCKAGE',
        'IRREGULAR_SUPPLY',
        'SEWAGE_OVERFLOW',
        'WATER_TANKER_REQUEST',
        'OTHER'
    ],
    MUNICIPAL: [
        'GARBAGE_NOT_COLLECTED', // Updated from GARBAGE_COLLECTION
        'STREET_LIGHT',
        'ROAD_DAMAGE',
        'DRAINAGE_BLOCKAGE', // Updated from DRAINAGE_ISSUE
        'ILLEGAL_DUMPING',
        'PARK_MAINTENANCE',
        'STRAY_ANIMAL', // Updated from STRAY_ANIMALS
        'PROPERTY_TAX_QUERY',
        'OTHER'
    ]
};

/**
 * GET /api/complaints/types
 * Get complaint types for a service
 */
exports.getComplaintTypes = async (req, res) => {
    try {
        const { serviceType } = req.query;

        if (!serviceType || !COMPLAINT_TYPES[serviceType]) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_SERVICE_TYPE',
                    message: 'Invalid service type'
                }
            });
        }

        res.json({
            success: true,
            serviceType,
            types: COMPLAINT_TYPES[serviceType]
        });

    } catch (error) {
        console.error('Get Complaint Types Error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch complaint types'
            }
        });
    }
};

/**
 * POST /api/complaints
 * Register new complaint
 */
exports.registerComplaint = async (req, res) => {
    try {
        const { citizenId } = req.user;
        const {
            serviceType,
            complaintType,
            title,
            description,
            location,
            latitude,
            longitude
        } = req.body;

        // Validate service type and complaint type
        if (!COMPLAINT_TYPES[serviceType]?.includes(complaintType)) {
            console.error(`Invalid complaint type: ${complaintType} for service: ${serviceType}`);
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_COMPLAINT_TYPE',
                    message: `Invalid complaint type: ${complaintType}`
                }
            });
        }

        // Auto-determine priority based on complaint type
        const urgentTypes = [
            'GAS_LEAK',
            'CONTAMINATED_WATER',
            'POWER_OUTAGE',
            'WIRE_DAMAGE',
            'PIPELINE_LEAKAGE',
            'REGULATOR_MALFUNCTION',
            'SEWAGE_OVERFLOW',
            'TRANSFORMER_ISSUE',
            'NO_WATER_SUPPLY'
        ];

        const priority = urgentTypes.includes(complaintType) ? 'URGENT' : 'MEDIUM';

        // Generate collision-proof Readable Complaint ID (CMP-YYYY-XXXXXXXX)
        const year = new Date().getFullYear();
        const uuidPart = crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase();
        const complaintNumber = `CMP-${year}-${uuidPart}`;

        // Create complaint
        const complaint = await prisma.complaint.create({
            data: {
                citizenId,
                serviceType,
                complaintType,
                title: title || complaintType.replace(/_/g, ' '),
                description,
                priority,
                status: 'OPEN',
                location,
                kioskId: req.headers['x-kiosk-id'] || null,
                complaintNumber
            }
        });

        // Create status history
        await prisma.complaintStatusHistory.create({
            data: {
                complaintId: complaint.complaintId,
                oldStatus: null,
                newStatus: 'OPEN',
                notes: 'Complaint registered'
            }
        });

        // Log audit
        await prisma.auditLog.create({
            data: {
                citizenId,
                action: 'COMPLAINT_REGISTERED',
                metadata: {
                    complaintId: complaint.complaintId,
                    serviceType,
                    complaintType,
                    priority
                }
            }
        });

        // Log kiosk activity
        if (req.headers['x-kiosk-id']) {
            await prisma.kioskLog.create({
                data: {
                    kioskId: req.headers['x-kiosk-id'],
                    citizenId,
                    action: 'COMPLAINT_REGISTERED',
                    metadata: {
                        complaintId: complaint.complaintId,
                        serviceType
                    }
                }
            });
        }

        res.json({
            success: true,
            message: 'Complaint registered successfully',
            complaintInternalId: complaint.complaintId, // Keep internal ID safe
            complaint: {
                complaintId: complaint.complaintNumber || complaint.complaintId,
                citizenId: complaint.citizenId,
                serviceType: complaint.serviceType,
                complaintType: complaint.complaintType,
                title: complaint.title,
                priority: complaint.priority,
                status: complaint.status,
                createdAt: complaint.createdAt
            }
        });

    } catch (error) {
        console.error('Register Complaint Error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to register complaint'
            }
        });
    }
};

/**
 * GET /api/complaints
 * Get all complaints for logged-in citizen
 */
exports.getMyComplaints = async (req, res) => {
    try {
        const { citizenId } = req.user;
        const { status, serviceType } = req.query;

        const complaints = await prisma.complaint.findMany({
            where: {
                citizenId,
                ...(status && { status }),
                ...(serviceType && { serviceType })
            },
            orderBy: { createdAt: 'desc' },
            include: {
                statusHistory: {
                    orderBy: { changedAt: 'desc' },
                    take: 1
                }
            }
        });

        // Calculate summary
        const summary = {
            total: complaints.length,
            open: complaints.filter(c => c.status === 'OPEN').length,
            inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
            resolved: complaints.filter(c => c.status === 'RESOLVED').length,
            closed: complaints.filter(c => c.status === 'CLOSED').length
        };

        res.json({
            success: true,
            complaints: complaints.map(c => ({
                ...c,
                originalId: c.complaintId,
                complaintId: c.complaintNumber || c.complaintId
            })),
            summary
        });

    } catch (error) {
        console.error('Get My Complaints Error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch complaints'
            }
        });
    }
};

/**
 * GET /api/complaints/:complaintId
 * Get complaint details
 */
exports.getComplaintDetails = async (req, res) => {
    try {
        const { citizenId } = req.user;
        const { complaintId } = req.params;

        const whereClause = complaintId.startsWith('CMP-')
            ? { complaintNumber: complaintId }
            : { complaintId };

        const complaint = await prisma.complaint.findFirst({
            where: {
                ...whereClause,
                citizenId
            },
            include: {
                citizen: {
                    select: {
                        fullName: true,
                        mobileNumber: true,
                        email: true
                    }
                },
                statusHistory: {
                    orderBy: { changedAt: 'desc' }
                }
            }
        });

        if (!complaint) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'COMPLAINT_NOT_FOUND',
                    message: 'Complaint not found'
                }
            });
        }

        // Get attached documents
        const documents = await prisma.document.findMany({
            where: {
                relatedEntity: 'COMPLAINT',
                relatedId: complaint.complaintId
            }
        });

        res.json({
            success: true,
            complaint: {
                ...complaint,
                originalId: complaint.complaintId,
                complaintId: complaint.complaintNumber || complaint.complaintId,
                documents
            }
        });

    } catch (error) {
        console.error('Get Complaint Details Error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch complaint details'
            }
        });
    }
};

/**
 * GET /api/complaints/track/:complaintId
 * Track complaint by ID (public - no auth required for kiosk)
 */
exports.trackComplaint = async (req, res) => {
    try {
        const { complaintId } = req.params;

        const whereClause = complaintId.startsWith('CMP-')
            ? { complaintNumber: complaintId }
            : { complaintId };

        const complaint = await prisma.complaint.findUnique({
            where: whereClause,
            select: {
                complaintId: true,
                complaintNumber: true,
                serviceType: true,
                complaintType: true,
                title: true,
                status: true,
                priority: true,
                createdAt: true,
                updatedAt: true,
                resolvedAt: true,
                statusHistory: {
                    orderBy: { changedAt: 'desc' }
                }
            }
        });

        if (!complaint) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'COMPLAINT_NOT_FOUND',
                    message: 'Complaint ID not found'
                }
            });
        }

        // Calculate estimated resolution time
        const avgResolutionDays = {
            URGENT: 1,
            HIGH: 3,
            MEDIUM: 7,
            LOW: 14
        };

        const estimatedResolution = new Date(complaint.createdAt);
        estimatedResolution.setDate(
            estimatedResolution.getDate() + avgResolutionDays[complaint.priority]
        );

        res.json({
            success: true,
            complaint: {
                ...complaint,
                originalId: complaint.complaintId,
                complaintId: complaint.complaintNumber || complaint.complaintId,
                estimatedResolution
            }
        });

    } catch (error) {
        console.error('Track Complaint Error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to track complaint'
            }
        });
    }
};

/**
 * POST /api/complaints/:complaintId/upload
 * Upload documents for complaint
 */
exports.uploadDocument = async (req, res) => {
    try {
        const { citizenId } = req.user;
        const { complaintId } = req.params;

        // Verify complaint belongs to citizen
        const whereClause = complaintId.startsWith('CMP-')
            ? { complaintNumber: complaintId }
            : { complaintId };

        const complaint = await prisma.complaint.findFirst({
            where: {
                ...whereClause,
                citizenId
            }
        });

        if (!complaint) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'COMPLAINT_NOT_FOUND',
                    message: 'Complaint not found'
                }
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'NO_FILE',
                    message: 'No file uploaded'
                }
            });
        }

        // Create document record
        const document = await prisma.document.create({
            data: {
                citizenId,
                relatedEntity: 'COMPLAINT',
                relatedId: complaint.complaintId, // Must use internal UUID
                documentType: req.file.mimetype.startsWith('image/') ? 'PHOTO' : 'PDF',
                fileName: req.file.originalname,
                filePath: req.file.path,
                fileSize: req.file.size,
                mimeType: req.file.mimetype
            }
        });

        res.json({
            success: true,
            message: 'Document uploaded successfully',
            document
        });

    } catch (error) {
        console.error('Upload Document Error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'UPLOAD_FAILED',
                message: 'Failed to upload document'
            }
        });
    }
};

module.exports = exports;