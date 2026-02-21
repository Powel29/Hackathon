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

        // Check if account is active
        if (account.status !== 'ACTIVE') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'ACCOUNT_INACTIVE',
                    message: `This account is currently ${account.status.toLowerCase()}. Please contact the department office.`
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
        let account = null;

        // Query the appropriate department table with full details
        switch (upperServiceType) {
            case 'ELECTRICITY':
                account = await prisma.electricityAccount.findFirst({
                    where: {
                        consumerNumber,
                        citizenId
                    },
                    include: {
                        bills: {
                            orderBy: { billingStartDate: 'desc' },
                            take: 12
                        },
                        consumptionHistory: {
                            orderBy: { date: 'desc' },
                            take: 30
                        }
                    }
                });
                break;

            case 'GAS':
                account = await prisma.gasAccount.findFirst({
                    where: {
                        consumerNumber,
                        citizenId
                    },
                    include: {
                        bills: {
                            orderBy: { billingStartDate: 'desc' },
                            take: 12
                        },
                        consumptionHistory: {
                            orderBy: { date: 'desc' },
                            take: 30
                        }
                    }
                });
                break;

            case 'WATER':
                account = await prisma.waterAccount.findFirst({
                    where: {
                        consumerNumber,
                        citizenId
                    },
                    include: {
                        bills: {
                            orderBy: { billingStartDate: 'desc' },
                            take: 12
                        },
                        consumptionHistory: {
                            orderBy: { date: 'desc' },
                            take: 30
                        }
                    }
                });
                break;

            case 'MUNICIPAL':
                account = await prisma.municipalAccount.findFirst({
                    where: {
                        propertyTaxNumber: consumerNumber,
                        citizenId
                    },
                    include: {
                        taxBills: {
                            orderBy: { billingPeriod: 'desc' },
                            take: 12
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
                    message: 'Account not found or does not belong to you'
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

module.exports = exports;
