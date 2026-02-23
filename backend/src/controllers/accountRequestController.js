const prisma = require('../utils/prismaClient');

// POST /api/departments/request-approval
// Called by kiosk citizen when their consumer number isn't found
exports.createRequest = async (req, res) => {
    try {
        const { serviceType, consumerNumber } = req.body;
        const citizenId = req.user.citizenId;

        if (!serviceType || !consumerNumber) {
            return res.status(400).json({
                success: false,
                message: 'serviceType and consumerNumber are required'
            });
        }

        // Prevent duplicate pending requests
        const existing = await prisma.accountRequest.findFirst({
            where: {
                citizenId,
                serviceType: serviceType.toUpperCase(),
                consumerNumber: consumerNumber.trim(),
                status: 'PENDING'
            }
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'You already have a pending request for this consumer number'
            });
        }

        const request = await prisma.accountRequest.create({
            data: {
                citizenId,
                serviceType: serviceType.toUpperCase(),
                consumerNumber: consumerNumber.trim(),
                status: 'PENDING'
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Account approval request submitted successfully. Admin will review it shortly.',
            requestId: request.id
        });
    } catch (error) {
        console.error('createRequest error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// GET /api/admin/account-requests
// Admin: list all account requests (default: PENDING)
exports.getPendingRequests = async (req, res) => {
    try {
        const { status = 'PENDING' } = req.query;

        const requests = await prisma.accountRequest.findMany({
            where: status === 'ALL' ? {} : { status },
            include: {
                citizen: {
                    select: {
                        aadharNumber: true,
                        fullName: true,
                        mobileNumber: true,
                        email: true
                    }
                }
            },
            orderBy: { requestedAt: 'desc' }
        });

        return res.json({ success: true, requests });
    } catch (error) {
        console.error('getPendingRequests error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// POST /api/admin/account-requests/:id/approve
// Admin: approve the request and create the department account
exports.approveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { accountData, adminNotes } = req.body;

        const request = await prisma.accountRequest.findUnique({ where: { id } });
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        if (request.status !== 'PENDING') return res.status(400).json({ success: false, message: 'Request is already resolved' });

        const { serviceType, consumerNumber, citizenId } = request;

        const crypto = require('crypto');
        const parseNum = (val) => val ? parseFloat(val) : null;
        const parseDate = (val) => val ? new Date(val) : null;
        const parseBool = (val) => val === 'true';

        // Create the appropriate account based on service type
        let createdAccount;
        switch (serviceType) {
            case 'ELECTRICITY':
                createdAccount = await prisma.electricityAccount.create({
                    data: {
                        accountId: crypto.randomUUID(),
                        consumerNumber,
                        citizenId,
                        connectionType: accountData.connectionType || 'DOMESTIC',
                        sanctionedLoad: accountData.sanctionedLoad || '0',
                        status: 'ACTIVE',
                        currentMonthUsage: parseNum(accountData.currentMonthUsage),
                        dailyAverage: parseNum(accountData.dailyAverage),
                        peakLoad: parseNum(accountData.peakLoad),
                        lastBillAmount: parseNum(accountData.lastBillAmount),
                        lastReadingDate: parseDate(accountData.lastReadingDate),
                        updatedAt: new Date()
                    }
                });
                break;
            case 'WATER':
                createdAccount = await prisma.waterAccount.create({
                    data: {
                        accountId: crypto.randomUUID(),
                        consumerNumber,
                        citizenId,
                        connectionType: accountData.connectionType || 'DOMESTIC',
                        status: 'ACTIVE',
                        pipeSize: accountData.pipeSize || null,
                        numberOfTaps: accountData.numberOfTaps ? parseInt(accountData.numberOfTaps) : null,
                        meterNumber: accountData.meterNumber || null,
                        currentMonthUsage: parseNum(accountData.currentMonthUsage),
                        dailyAverage: parseNum(accountData.dailyAverage),
                        waterPressure: parseNum(accountData.waterPressure),
                        lastBillAmount: parseNum(accountData.lastBillAmount),
                        lastBillDate: parseDate(accountData.lastBillDate),
                        dueAmount: parseNum(accountData.dueAmount),
                        lastMeterReading: parseNum(accountData.lastMeterReading),
                        lastReadingDate: parseDate(accountData.lastReadingDate),
                        nextReadingDate: parseDate(accountData.nextReadingDate),
                        lastQualityTest: parseDate(accountData.lastQualityTest),
                        waterQualityStatus: accountData.waterQualityStatus || null,
                        phLevel: parseNum(accountData.phLevel),
                        tdsLevel: parseNum(accountData.tdsLevel),
                        chlorineLevel: parseNum(accountData.chlorineLevel),
                        turbidityLevel: parseNum(accountData.turbidityLevel),
                        hardnessLevel: parseNum(accountData.hardnessLevel),
                        connectionDate: parseDate(accountData.connectionDate),
                        updatedAt: new Date()
                    }
                });
                break;
            case 'GAS':
                createdAccount = await prisma.gasAccount.create({
                    data: {
                        accountId: crypto.randomUUID(),
                        consumerNumber,
                        citizenId,
                        connectionType: accountData.connectionType || 'DOMESTIC',
                        gasType: accountData.gasType || 'PNG',
                        status: 'ACTIVE',
                        pipelineSize: accountData.pipelineSize || null,
                        currentMonthUsage: parseNum(accountData.currentMonthUsage),
                        dailyAverage: parseNum(accountData.dailyAverage),
                        pressure: parseNum(accountData.pressure),
                        lastBillAmount: parseNum(accountData.lastBillAmount),
                        lastReadingDate: parseDate(accountData.lastReadingDate),
                        nextSafetyCheck: parseDate(accountData.nextSafetyCheck),
                        updatedAt: new Date()
                    }
                });
                break;
            case 'MUNICIPAL':
                createdAccount = await prisma.municipalAccount.create({
                    data: {
                        accountId: crypto.randomUUID(),
                        propertyTaxNumber: consumerNumber,
                        citizenId,
                        propertyType: accountData.propertyType || 'RESIDENTIAL',
                        status: 'ACTIVE',
                        propertyArea: parseNum(accountData.propertyArea),
                        propertyValue: parseNum(accountData.propertyValue),
                        constructionYear: accountData.constructionYear ? parseInt(accountData.constructionYear) : null,
                        numberOfFloors: accountData.numberOfFloors ? parseInt(accountData.numberOfFloors) : null,
                        annualTaxAmount: parseNum(accountData.annualTaxAmount),
                        taxCategory: accountData.taxCategory || null,
                        lastBillAmount: parseNum(accountData.lastBillAmount),
                        lastBillDate: parseDate(accountData.lastBillDate),
                        dueAmount: parseNum(accountData.dueAmount),
                        garbageCollection: accountData.garbageCollection ? parseBool(accountData.garbageCollection) : true,
                        drainageConnection: accountData.drainageConnection ? parseBool(accountData.drainageConnection) : true,
                        streetLightCoverage: accountData.streetLightCoverage ? parseBool(accountData.streetLightCoverage) : true,
                        registrationDate: parseDate(accountData.registrationDate),
                        updatedAt: new Date()
                    }
                });
                break;
            default:
                return res.status(400).json({ success: false, message: 'Unknown service type' });
        }

        // Mark request as approved
        await prisma.accountRequest.update({
            where: { id },
            data: {
                status: 'APPROVED',
                adminNotes: adminNotes || null,
                resolvedAt: new Date()
            }
        });

        // CRITICAL FIX: Link the newly created department account to the citizen's service_accounts
        // so it appears in their main dashboard and they are authorized to view details.
        await prisma.serviceAccount.create({
            data: {
                citizenId,
                serviceType: serviceType.toUpperCase(),
                accountNumber: consumerNumber,
                status: 'ACTIVE'
            }
        });

        return res.json({
            success: true,
            message: `${serviceType} account created and linked successfully`,
            account: createdAccount
        });
    } catch (error) {
        console.error('approveRequest error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

// POST /api/admin/account-requests/:id/reject
exports.rejectRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminNotes } = req.body;

        const request = await prisma.accountRequest.findUnique({ where: { id } });
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        if (request.status !== 'PENDING') return res.status(400).json({ success: false, message: 'Request is already resolved' });

        await prisma.accountRequest.update({
            where: { id },
            data: { status: 'REJECTED', adminNotes: adminNotes || null, resolvedAt: new Date() }
        });

        return res.json({ success: true, message: 'Request rejected' });
    } catch (error) {
        console.error('rejectRequest error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
