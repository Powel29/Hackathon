const prisma = require('../utils/prismaClient');

/**
 * GET /api/service-accounts
 * Get all service accounts for logged-in citizen
 */
exports.getServiceAccounts = async (req, res) => {
    try {
        const { citizenId } = req.user;

        const accounts = await prisma.serviceAccount.findMany({
            where: { citizenId },
            include: {
                bills: {
                    where: { status: 'UNPAID' },
                    orderBy: { dueDate: 'asc' },
                    take: 3 // 3 most urgent unpaid bills (earliest due dates)
                }            }
        });

        res.json({
            success: true,
            accounts
        });

    } catch (error) {
        console.error('Get Service Accounts Error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch service accounts'
            }
        });
    }
};

/**
 * POST /api/service-accounts/link
 * Link new service account (verify consumer ID)
 */
exports.linkServiceAccount = async (req, res) => {
    try {
        const { citizenId } = req.user;
        const { serviceType, accountNumber } = req.body;

        // Validate service type
        const validServices = ['ELECTRICITY', 'GAS', 'WATER', 'MUNICIPAL'];
        if (!validServices.includes(serviceType)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_SERVICE_TYPE',
                    message: 'Invalid service type'
                }
            });
        }

        // Check if account already linked
        const existing = await prisma.serviceAccount.findFirst({
            where: {
                citizenId,
                serviceType,
                accountNumber
            }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'ALREADY_LINKED',
                    message: 'This account is already linked to your profile'
                }
            });
        }

        // In production: Verify account exists in utility database
        // For demo: Accept any account number

        const account = await prisma.serviceAccount.create({
            data: {
                citizenId,
                serviceType,
                accountNumber,
                status: 'ACTIVE'
            }
        });

        // Log to audit
        await prisma.auditLog.create({
            data: {
                citizenId,
                action: 'SERVICE_ACCOUNT_LINKED',
                metadata: { serviceType, accountNumber }
            }
        });

        res.json({
            success: true,
            message: 'Service account linked successfully',
            account
        });

    } catch (error) {
        console.error('Link Service Account Error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to link service account'
            }
        });
    }
};

/**
 * GET /api/service-accounts/:accountId
 * Get specific service account details
 */
exports.getServiceAccountDetails = async (req, res) => {
    try {
        const { citizenId } = req.user;
        const { accountId } = req.params;

        const account = await prisma.serviceAccount.findFirst({
            where: {
                accountId,
                citizenId
            },
            include: {
                bills: {
                    orderBy: { billingDate: 'desc' },
                    take: 10
                }
            }
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'ACCOUNT_NOT_FOUND',
                    message: 'Service account not found'
                }
            });
        }

        res.json({
            success: true,
            account
        });

    } catch (error) {
        console.error('Get Account Details Error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch account details'
            }
        });
    }
};

module.exports = exports;