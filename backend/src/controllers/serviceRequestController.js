const prisma = require('../utils/prismaClient');

/**
 * POST /api/service-requests
 * Create a new service request
 */
exports.createServiceRequest = async (req, res) => {
    try {
        const citizenId = req.user.citizenId;
        const { serviceType, requestType, details } = req.body;

        // Basic validation
        if (!serviceType || !requestType || !details) {
            return res.status(400).json({
                success: false,
                message: 'All fields (serviceType, requestType, details) are required.'
            });
        }

        // Ensure Request Type exists (Upsert if not exists - defensive coding)
        // In a real app, this should be pre-seeded.
        const existingType = await prisma.serviceRequestType.findUnique({
            where: { requestTypeCode: requestType }
        });

        if (!existingType) {
            await prisma.serviceRequestType.create({
                data: {
                    requestTypeCode: requestType,
                    description: `${requestType.replace('_', ' ')} Service Request`,
                    isActive: true
                }
            });
        }

        // Create Request
        const newRequest = await prisma.serviceRequest.create({
            data: {
                citizenId,
                serviceType, // e.g., 'WATER'
                requestType, // e.g., 'WATER_TANKER'
                status: 'PENDING',
                details: details, // JSON object with form data
            }
        });

        res.status(201).json({
            success: true,
            message: 'Service request created successfully',
            requestId: newRequest.requestId,
            request: newRequest
        });

    } catch (error) {
        console.error('Create Service Request Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create service request',
            error: error.message
        });
    }
};

/**
 * GET /api/service-requests/:requestId
 * Get service request by ID
 */
exports.getServiceRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const citizenId = req.user.citizenId;

        const request = await prisma.serviceRequest.findUnique({
            where: { requestId },
            include: { type: true }
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found'
            });
        }

        // Authorization check
        if (request.citizenId !== citizenId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access to this request'
            });
        }

        res.json({
            success: true,
            request
        });

    } catch (error) {
        console.error('Get Service Request Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch service request',
            error: error.message
        });
    }
};

/**
 * GET /api/service-requests
 * Get all service requests for user
 */
exports.getMyServiceRequests = async (req, res) => {
    try {
        const citizenId = req.user.citizenId;

        const requests = await prisma.serviceRequest.findMany({
            where: { citizenId },
            orderBy: { createdAt: 'desc' },
            include: { type: true }
        });

        res.json({
            success: true,
            requests
        });

    } catch (error) {
        console.error('Get My Service Requests Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch service requests',
            error: error.message
        });
    }
};
