const prisma = require('../utils/prismaClient');

/**
 * POST /api/departments/verify
 * Verify department-specific consumer number (public endpoint)
 */
exports.verifyDepartmentAccount = async (req, res) => {
    try {
        const { serviceType, consumerNumber } = req.body;

        // Validate service type
        const validServices = ['ELECTRICITY', 'GAS', 'WATER', 'MUNICIPAL'];
        if (!serviceType || typeof serviceType !== 'string' || !validServices.includes(serviceType.toUpperCase())) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_SERVICE_TYPE',
                    message: 'Invalid service type. Must be ELECTRICITY, GAS, WATER, or MUNICIPAL'
                }
            });
        }

        if (!consumerNumber || !consumerNumber.trim()) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_CONSUMER_NUMBER',
                    message: 'Consumer number is required'
                }
            });
        }

        const upperServiceType = serviceType.toUpperCase();
        const trimmedConsumerNumber = consumerNumber.trim();

        let account = null;

        // Query the appropriate department table based on service type
        switch (upperServiceType) {
            case 'ELECTRICITY':
                account = await prisma.electricityAccount.findUnique({
                    where: { consumerNumber: trimmedConsumerNumber },
                    select: {
                        accountId: true,
                        citizenId: true,
                        consumerNumber: true,
                        connectionType: true,
                        status: true,
                        citizen: {
                            select: {
                                fullName: true,
                                mobileNumber: true
                            }
                        }
                    }
                });
                break;

            case 'GAS':
                account = await prisma.gasAccount.findUnique({
                    where: { consumerNumber: trimmedConsumerNumber },
                    select: {
                        accountId: true,
                        citizenId: true,
                        consumerNumber: true,
                        connectionType: true,
                        gasType: true,
                        status: true,
                        citizen: {
                            select: {
                                fullName: true,
                                mobileNumber: true
                            }
                        }
                    }
                });
                break;

            case 'WATER':
                account = await prisma.waterAccount.findUnique({
                    where: { consumerNumber: trimmedConsumerNumber },
                    select: {
                        accountId: true,
                        citizenId: true,
                        consumerNumber: true,
                        connectionType: true,
                        status: true,
                        citizen: {
                            select: {
                                fullName: true,
                                mobileNumber: true
                            }
                        }
                    }
                });
                break;

            case 'MUNICIPAL':
                account = await prisma.municipalAccount.findUnique({
                    where: { propertyTaxNumber: trimmedConsumerNumber },
                    select: {
                        accountId: true,
                        citizenId: true,
                        propertyTaxNumber: true,
                        propertyType: true,
                        status: true,
                        citizen: {
                            select: {
                                fullName: true,
                                mobileNumber: true
                            }
                        }
                    }
                });
                break;
        }

        if (!account) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'ACCOUNT_NOT_FOUND',
                    message: `No ${serviceType.toLowerCase()} account found with this consumer number`
                }
            });
        }

        // STRICT OWNERSHIP CHECK: Must match the logged-in user's Aadhaar
        if (account.citizenId !== req.user.citizenId) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'This consumer number belongs to another citizen record'
                }
            });
        }

        // Check if account is active
        if (typeof account.status !== 'string' || account.status.toUpperCase() !== 'ACTIVE') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'ACCOUNT_INACTIVE',
                    message: `This account is currently ${account.status ? account.status.toLowerCase() : 'unknown'}. Please contact the department office.`
                }
            });
        }

        // AUTO-LINK: If this account is not already in the user's dashboard (service_accounts), link it now.
        // This ensures the user can actually view the details after verification.
        const existingLink = await prisma.serviceAccount.findFirst({
            where: {
                citizenId: req.user.citizenId,
                accountNumber: trimmedConsumerNumber,
                serviceType: upperServiceType
            }
        });

        if (!existingLink) {
            await prisma.serviceAccount.create({
                data: {
                    citizenId: req.user.citizenId,
                    accountNumber: trimmedConsumerNumber,
                    serviceType: upperServiceType,
                    status: 'ACTIVE'
                }
            });
        }

        // Compute a defensive masked mobile value to avoid exceptions
        const mobile = account?.citizen?.mobileNumber;
        let maskedMobileValue = '********';
        if (typeof mobile === 'string') {
            if (mobile.length >= 4) {
                const last4 = mobile.slice(-4);
                const stars = '*'.repeat(Math.max(0, mobile.length - 4));
                maskedMobileValue = `${stars}${last4}`;
            } else {
                // short or unexpected format — use fixed placeholder
                maskedMobileValue = '********';
            }
        }

        res.json({
            success: true,
            message: 'Account verified successfully',
            account: {
                accountId: account.accountId,
                consumerNumber: account.consumerNumber || account.propertyTaxNumber,
                connectionType: account.connectionType || account.propertyType,
                status: account.status,
                ownerName: account.citizen?.fullName || null,
                maskedMobile: maskedMobileValue
            }
        });

    } catch (error) {
        console.error('Verify Department Account Error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to verify account. Please try again later.'
            }
        });
    }
};

/**
 * GET /api/departments/:serviceType/:consumerNumber
 * Get full department account details (protected endpoint)
 */
exports.getDepartmentAccountDetails = async (req, res) => {
    try {
        const { citizenId } = req.user;
        const { serviceType, consumerNumber } = req.params;

        const validServices = ['ELECTRICITY', 'GAS', 'WATER', 'MUNICIPAL'];
        if (!validServices.includes(serviceType.toUpperCase())) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_SERVICE_TYPE',
                    message: 'Invalid service type'
                }
            });
        }

        const upperServiceType = serviceType.toUpperCase();

        // STEP 1: Authorization — verify this consumer number is linked to the logged-in user
        // via the service_accounts table. This prevents any user from accessing accounts
        // they don't own by guessing consumer numbers in the URL.
        const linkedAccount = await prisma.serviceAccount.findFirst({
            where: {
                citizenId,
                accountNumber: consumerNumber,
                serviceType: upperServiceType
            }
        });

        if (!linkedAccount) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'This consumer number is not linked to your account'
                }
            });
        }

        // STEP 2: Fetch full department account details by consumer number
        let account = null;

        switch (upperServiceType) {
            case 'ELECTRICITY':
                account = await prisma.electricityAccount.findUnique({
                    where: { consumerNumber },
                    include: {
                        bills: { orderBy: { billingStartDate: 'desc' }, take: 12 },
                        consumptionHistory: { orderBy: { date: 'desc' }, take: 30 }
                    }
                });
                break;

            case 'GAS':
                account = await prisma.gasAccount.findUnique({
                    where: { consumerNumber },
                    include: {
                        bills: { orderBy: { billingStartDate: 'desc' }, take: 12 },
                        consumptionHistory: { orderBy: { date: 'desc' }, take: 30 }
                    }
                });
                break;

            case 'WATER':
                account = await prisma.waterAccount.findUnique({
                    where: { consumerNumber },
                    include: {
                        bills: { orderBy: { billingStartDate: 'desc' }, take: 12 },
                        consumptionHistory: { orderBy: { date: 'desc' }, take: 30 }
                    }
                });
                break;

            case 'MUNICIPAL':
                account = await prisma.municipalAccount.findUnique({
                    where: { propertyTaxNumber: consumerNumber },
                    include: {
                        taxBills: { orderBy: { billingPeriod: 'desc' }, take: 12 }
                    }
                });
                break;
        }

        // STEP 3: Strict Ownership Check
        // Even if found, only allow if the account record belongs to the current citizen
        if (!account || account.citizenId !== citizenId) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'ACCESS_DENIED',
                    message: 'Account not found or does not belong to you in department records'
                }
            });
        }

        res.json({
            success: true,
            account
        });

    } catch (error) {
        console.error('Get Department Account Details Error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Failed to fetch account details'
            }
        });
    }
};

// GET /api/departments/:serviceType/alerts
exports.getDepartmentAlerts = async (req, res) => {
    try {
        const { serviceType } = req.params;
        const upperServiceType = serviceType.toUpperCase();

        const serviceTypesToFetch = [upperServiceType, 'ALL'];
        if (upperServiceType === 'MUNICIPAL') {
            serviceTypesToFetch.push('PROPERTY TAX', 'PROPERTY_TAX');
        } else if (upperServiceType === 'PROPERTY TAX' || upperServiceType === 'PROPERTY_TAX') {
            serviceTypesToFetch.push('MUNICIPAL');
        }

        const now = new Date();
        const alerts = await prisma.alert.findMany({
            where: {
                AND: [
                    {
                        OR: serviceTypesToFetch.map(type => ({
                            serviceType: {
                                equals: type,
                                mode: 'insensitive'
                            }
                        }))
                    },
                    { isActive: true },
                    { startsAt: { lte: now } },
                    {
                        OR: [
                            { endsAt: null },
                            { endsAt: { gte: now } }
                        ]
                    }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            alerts
        });
    } catch (error) {
        console.error('Get Department Alerts Error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Failed to fetch department alerts'
            }
        });
    }
};

module.exports = exports;
