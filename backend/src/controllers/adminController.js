// Prisma Client updated with Kiosk model
const prisma = require('../config/prisma');
const generateSignedUrl = require('../services/s3Download.service');

// Keep the mapping logic simple to match frontend needs

// Helper to get citizen name safely
const getCitizenName = (citizen) => citizen ? citizen.fullName : 'Unknown';
const getCitizenMobile = (citizen) => citizen ? citizen.mobileNumber : 'Unknown';

exports.getComplaints = async (req, res) => {
    try {
        const complaints = await prisma.complaint.findMany({
            include: {
                citizen: true,
                statusHistory: {
                    orderBy: { changedAt: 'desc' }
                }
            }
        });

        // Fetch attachments for all complaints
        const complaintIds = complaints.map(c => c.complaintId);
        const documents = await prisma.document.findMany({
            where: {
                relatedEntity: 'COMPLAINT',
                relatedId: { in: complaintIds }
            }
        });

        const formatted = await Promise.all(complaints.map(async c => {
            const attachments = await Promise.all(documents
                .filter(doc => doc.relatedId === c.complaintId)
                .map(async doc => {
                    const isPdf = doc.mimeType === 'application/pdf' || (doc.fileName && doc.fileName.toLowerCase().endsWith('.pdf'));
                    let signedUrl = null;
                    try {
                        signedUrl = await generateSignedUrl(doc.filePath, doc.fileName);
                    } catch (err) {
                        console.error(`Failed to generate signed URL for document ${doc.documentId}:`, err.message);
                    }
                    return {
                        id: doc.documentId,
                        name: doc.fileName || doc.documentType.replace(/_/g, ' '),
                        type: isPdf ? 'pdf' : 'image',
                        dataUrl: signedUrl
                    };
                }));

            return {
                id: c.complaintId,
                complaintId: c.complaintNumber || c.complaintId.split('-')[0],
                citizenName: getCitizenName(c.citizen),
                citizenMobile: getCitizenMobile(c.citizen),
                consumerId: c.citizenId,
                serviceType: c.serviceType.toLowerCase(),
                complaintType: c.complaintType,
                description: c.description,
                priority: c.priority.toLowerCase(),
                status: c.status.toLowerCase().replace(/\s+/g, '_'),
                location: c.location || '',
                assignedTo: c.assignedTo || '',
                adminNotes: '',
                citizenUpdateMessage: c.resolutionNote || '',
                attachments: attachments,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
                slaDeadline: new Date(new Date(c.createdAt).getTime() + 48 * 60 * 60 * 1000).toISOString(),
                statusHistory: c.statusHistory.map(h => ({
                    status: h.newStatus,
                    timestamp: h.changedAt,
                    note: h.notes || '',
                    citizenMessage: h.citizenMessage || '',
                    by: h.changedBy || 'Admin'
                }))
            };
        }));

        res.json({ success: true, data: formatted });
    } catch (error) {
        console.error('getComplaints error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch complaints' });
    }
};

exports.updateComplaint = async (req, res) => {
    const { id } = req.params;
    const { status, adminNotes, citizenMessage, by, assignedTo } = req.body;
    try {
        const existing = await prisma.complaint.findUnique({
            where: { complaintId: id }
        });

        if (!existing) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        const normalizedStatus = status ? status.toUpperCase() : existing.status;
        const updateData = {};

        if (status) updateData.status = normalizedStatus;
        if (citizenMessage) updateData.resolutionNote = citizenMessage;
        if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

        // Update resolvedAt if status changed to RESOLVED
        if (normalizedStatus === 'RESOLVED' && existing.status !== 'RESOLVED') {
            updateData.resolvedAt = new Date();
        }

        const complaint = await prisma.complaint.update({
            where: { complaintId: id },
            data: updateData
        });

        // Always create a history entry if something changed
        await prisma.complaintStatusHistory.create({
            data: {
                complaintId: id,
                newStatus: normalizedStatus,
                oldStatus: existing.status,
                changedBy: by || 'Admin',
                notes: adminNotes || '',
                citizenMessage: citizenMessage || ''
            }
        });

        res.json({ success: true, data: complaint });
    } catch (error) {
        console.error('updateComplaint error:', error);
        res.status(500).json({ success: false, message: 'Failed to update complaint' });
    }
};

exports.searchCitizens = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.json({ success: true, data: [] });
        }

        const query = q.toLowerCase();

        // Search Citizen table
        const citizens = await prisma.citizen.findMany({
            where: {
                OR: [
                    { mobileNumber: { contains: query } },
                    { aadharNumber: { contains: query } },
                    { fullName: { contains: query, mode: 'insensitive' } },
                ]
            },
            take: 10,
            include: {
                _count: {
                    select: {
                        complaints: true
                    }
                },
                electricityAccounts: { include: { bills: { where: { status: 'pending' } } } },
                waterAccounts: { include: { bills: { where: { status: 'pending' } } } },
                gasAccounts: { include: { bills: { where: { status: 'pending' } } } },
                municipalAccounts: { include: { taxBills: { where: { status: 'pending' } } } },
                kioskLogs: {
                    orderBy: { timestamp: 'desc' },
                    take: 1,
                    select: {
                        kioskId: true,
                        timestamp: true
                    }
                }
            }
        });

        const formatted = citizens.map(c => {
            // Calculate total pending bills
            let pendingBills = 0;
            if (c.electricityAccounts) pendingBills += c.electricityAccounts.bills.length;
            if (c.waterAccounts) pendingBills += c.waterAccounts.bills.length;
            if (c.gasAccounts) pendingBills += c.gasAccounts.bills.length;
            if (c.municipalAccounts) pendingBills += c.municipalAccounts.taxBills.length;

            // Determine consumer ID by priority
            let consumerId = c.aadharNumber;
            let dept = 'registered';

            if (c.electricityAccounts) { consumerId = c.electricityAccounts.consumerNumber; dept = 'electricity'; }
            else if (c.waterAccounts) { consumerId = c.waterAccounts.consumerNumber; dept = 'water'; }
            else if (c.gasAccounts) { consumerId = c.gasAccounts.consumerNumber; dept = 'gas'; }
            else if (c.municipalAccounts) { consumerId = c.municipalAccounts.propertyTaxNumber; dept = 'municipal'; }

            // Last Kiosk
            const lastKioskLog = c.kioskLogs && c.kioskLogs.length > 0 ? c.kioskLogs[0] : null;
            const lastKiosk = lastKioskLog ? `Kiosk ${lastKioskLog.kioskId}` : 'Never used a Kiosk';
            const lastActive = lastKioskLog
                ? new Date(lastKioskLog.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                : new Date(c.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

            return {
                id: c.aadharNumber.substring(0, 4) + '...' + c.aadharNumber.slice(-4), // Mask ID for safety
                rawId: c.aadharNumber,
                name: c.fullName,
                mobile: c.mobileNumber,
                consumerId,
                dept,
                lastActive,
                complaints: c._count.complaints,
                bills: pendingBills,
                lastKiosk
            };
        });

        res.json({ success: true, data: formatted });
    } catch (error) {
        console.error('searchCitizens error:', error);
        res.status(500).json({ success: false, message: 'Failed to search citizens' });
    }
};

exports.getConnections = async (req, res) => {
    try {
        const connections = await prisma.connectionApplication.findMany({
            include: { citizen: true }
        });

        // Fetch all documents for these connections
        const appIds = connections.map(c => c.id);
        const documents = await prisma.document.findMany({
            where: {
                relatedEntity: 'CONNECTION_APPLICATION',
                relatedId: { in: appIds }
            }
        });

        const formatted = await Promise.all(connections.map(async c => {
            // Find documents belonging to this connection
            const connectionDocs = await Promise.all(documents
                .filter(doc => doc.relatedId === c.id)
                .map(async doc => {
                    const isPdf = doc.mimeType === 'application/pdf' || (doc.fileName && doc.fileName.toLowerCase().endsWith('.pdf'));
                    let signedUrl = null;
                    try {
                        signedUrl = await generateSignedUrl(doc.filePath, doc.fileName);
                    } catch (err) {
                        console.error(`Failed to generate signed URL for document ${doc.documentId}:`, err.message);
                    }
                    return {
                        id: doc.documentId,
                        name: doc.documentType.replace(/_/g, ' '),
                        type: isPdf ? 'pdf' : 'image',
                        dataUrl: signedUrl,
                        verified: true // Can be added to DB schema later
                    };
                }));

            return {
                id: c.id,
                applicationId: c.applicationId,
                applicantName: c.applicantName,
                mobile: c.mobileNumber,
                email: c.email,
                serviceType: c.serviceType.toLowerCase(),
                connectionType: c.connectionType.toLowerCase(),
                propertyAddress: `${c.address}, ${c.city}, ${c.state} - ${c.pincode}`,
                latitude: c.serviceDetails?.latitude || null,
                longitude: c.serviceDetails?.longitude || null,
                status: c.status.toLowerCase().replace(/\s+/g, '_'),
                documents: connectionDocs,
                adminNotes: c.reviewNotes || '',
                rejectionReason: c.rejectionReason || '',
                appliedAt: c.createdAt,
                statusHistory: [] // Can be added
            };
        }));

        res.json({ success: true, data: formatted });
    } catch (error) {
        console.error('getConnections error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch connections' });
    }
};

exports.updateConnection = async (req, res) => {
    const { id } = req.params;
    const { status, notes, rejectionReason } = req.body;
    try {
        const connection = await prisma.connectionApplication.update({
            where: { id },
            data: {
                status,
                reviewNotes: notes,
                rejectionReason: rejectionReason || null
            }
        });
        res.json({ success: true, data: connection });
    } catch (error) {
        console.error('updateConnection error:', error);
        res.status(500).json({ success: false, message: 'Failed to update connection' });
    }
};

exports.getRequests = async (req, res) => {
    try {
        const requests = await prisma.serviceRequest.findMany({
            include: { citizen: true }
        });

        const formatted = requests.map(r => {
            let detailsObj = {};
            if (r.details) {
                try { detailsObj = typeof r.details === 'string' ? JSON.parse(r.details) : r.details; } catch (e) { }
            }

            const _adminMeta = detailsObj._adminMeta || {};

            // Remove _adminMeta from the citizen-facing description
            const { _adminMeta: _, ...citizenDetails } = detailsObj;

            return {
                id: r.requestId,
                requestId: r.requestId.substring(0, 8),
                citizenName: getCitizenName(r.citizen),
                mobile: getCitizenMobile(r.citizen),
                serviceType: r.serviceType.toLowerCase(),
                requestType: r.requestType,
                description: Object.keys(citizenDetails).length > 0 ? JSON.stringify(citizenDetails) : '',
                status: r.status.toLowerCase(),
                scheduledDate: _adminMeta.scheduledDate || '',
                assignedTo: _adminMeta.assignedTo || '',
                adminNotes: _adminMeta.adminNotes || '',
                createdAt: r.createdAt,
                statusHistory: _adminMeta.statusHistory || []
            };
        });

        res.json({ success: true, data: formatted });
    } catch (error) {
        console.error('getRequests error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch requests' });
    }
};

exports.updateRequest = async (req, res) => {
    const { id } = req.params;
    const { status, assignedTo, notes, scheduledDate } = req.body;
    try {
        const existing = await prisma.serviceRequest.findUnique({ where: { requestId: id } });
        if (!existing) return res.status(404).json({ success: false, message: 'Request not found' });

        let detailsObj = {};
        if (existing.details) {
            try { detailsObj = typeof existing.details === 'string' ? JSON.parse(existing.details) : existing.details; } catch (e) { }
        }

        let _adminMeta = detailsObj._adminMeta || { statusHistory: [] };

        // Push to status history if status changed
        if ((status && existing.status !== status.toUpperCase()) || notes) {
            _adminMeta.statusHistory.push({
                status: status || existing.status.toLowerCase(),
                timestamp: new Date().toISOString(),
                note: notes || `Status updated to ${status}`,
                by: 'Admin'
            });
        }

        _adminMeta = {
            ..._adminMeta,
            assignedTo: assignedTo !== undefined ? assignedTo : _adminMeta.assignedTo,
            scheduledDate: scheduledDate !== undefined ? scheduledDate : _adminMeta.scheduledDate,
            adminNotes: notes !== undefined ? notes : _adminMeta.adminNotes
        };

        detailsObj._adminMeta = _adminMeta;

        const request = await prisma.serviceRequest.update({
            where: { requestId: id },
            data: {
                ...(status && { status: status.toUpperCase() }),
                details: detailsObj,
                updatedAt: new Date()
            }
        });

        res.json({ success: true, data: request });
    } catch (error) {
        console.error('updateRequest error:', error);
        res.status(500).json({ success: false, message: 'Failed to update request' });
    }
};

exports.getBills = async (req, res) => {
    try {
        // Fetch bills from all 4 tables and combine
        const [electricityBills, waterBills, gasBills, municipalBills] = await Promise.all([
            prisma.electricityBill.findMany({ include: { account: { include: { citizen: true } } } }),
            prisma.waterBill.findMany({ include: { account: { include: { citizen: true } } } }),
            prisma.gasBill.findMany({ include: { account: { include: { citizen: true } } } }),
            prisma.municipalBill.findMany({ include: { account: { include: { citizen: true } } } })
        ]);

        const formatBill = (b, type) => ({
            id: b.billId,
            billNumber: b.billNumber,
            citizenName: getCitizenName(b.account?.citizen),
            consumerId: b.account?.consumerNumber || b.account?.propertyTaxNumber || '',
            serviceType: type,
            amount: parseFloat(b.totalAmount),
            dueDate: b.dueDate,
            status: b.status.toLowerCase(),
            billingPeriod: b.billingPeriod,
            alertSent: false,
            alertMessage: '',
            alertSentAt: ''
        });

        const allBills = [
            ...electricityBills.map(b => formatBill(b, 'electricity')),
            ...waterBills.map(b => formatBill(b, 'water')),
            ...gasBills.map(b => formatBill(b, 'gas')),
            ...municipalBills.map(b => formatBill(b, 'municipal'))
        ];

        res.json({ success: true, data: allBills });
    } catch (error) {
        console.error('getBills error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch bills' });
    }
};

exports.createBill = async (req, res) => {
    try {
        const { citizenId, serviceType, amount, dueDate, billingPeriod, unitsConsumed, readings, details } = req.body;

        if (!citizenId || !serviceType || !amount || !dueDate) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const billId = require('crypto').randomUUID();
        const billNumber = `${serviceType.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

        let newBill;

        switch (serviceType.toUpperCase()) {
            case 'ELECTRICITY': {
                const account = await prisma.electricityAccount.findUnique({ where: { citizenId } });
                if (!account) return res.status(404).json({ success: false, message: 'Electricity account not found' });
                newBill = await prisma.electricityBill.create({
                    data: {
                        billId,
                        accountId: account.accountId,
                        billNumber,
                        billingPeriod: billingPeriod || 'Current',
                        billingStartDate: new Date(),
                        billingEndDate: new Date(),
                        unitsConsumed: parseFloat(unitsConsumed || 0),
                        previousReading: parseFloat(readings?.previous || 0),
                        currentReading: parseFloat(readings?.current || 0),
                        energyCharges: parseFloat(amount) * 0.8,
                        fixedCharges: parseFloat(amount) * 0.1,
                        taxAmount: parseFloat(amount) * 0.1,
                        totalAmount: parseFloat(amount),
                        dueDate: new Date(dueDate),
                        status: 'pending'
                    }
                });
                break;
            }
            case 'WATER': {
                const account = await prisma.waterAccount.findUnique({ where: { citizenId } });
                if (!account) return res.status(404).json({ success: false, message: 'Water account not found' });
                newBill = await prisma.waterBill.create({
                    data: {
                        billId,
                        accountId: account.accountId,
                        billNumber,
                        billingPeriod: billingPeriod || 'Current',
                        billingStartDate: new Date(),
                        billingEndDate: new Date(),
                        unitsConsumed: parseFloat(unitsConsumed || 0),
                        previousReading: 0,
                        currentReading: 0,
                        waterCharges: parseFloat(amount) * 0.9,
                        fixedCharges: parseFloat(amount) * 0.1,
                        taxAmount: 0,
                        totalAmount: parseFloat(amount),
                        dueDate: new Date(dueDate),
                        status: 'pending'
                    }
                });
                break;
            }
            case 'GAS': {
                const account = await prisma.gasAccount.findUnique({ where: { citizenId } });
                if (!account) return res.status(404).json({ success: false, message: 'Gas account not found' });
                newBill = await prisma.gasBill.create({
                    data: {
                        billId,
                        accountId: account.accountId,
                        billNumber,
                        billingPeriod: billingPeriod || 'Current',
                        billingStartDate: new Date(),
                        billingEndDate: new Date(),
                        unitsConsumed: parseFloat(unitsConsumed || 0),
                        previousReading: 0,
                        currentReading: 0,
                        gasCharges: parseFloat(amount) * 0.9,
                        fixedCharges: parseFloat(amount) * 0.1,
                        taxAmount: 0,
                        totalAmount: parseFloat(amount),
                        dueDate: new Date(dueDate),
                        status: 'pending'
                    }
                });
                break;
            }
            case 'MUNICIPAL': {
                const account = await prisma.municipalAccount.findUnique({ where: { citizenId } });
                if (!account) return res.status(404).json({ success: false, message: 'Municipal account not found' });
                newBill = await prisma.municipalBill.create({
                    data: {
                        billId,
                        accountId: account.accountId,
                        billNumber,
                        billingPeriod: billingPeriod || 'Current',
                        financialYear: details?.financialYear || '2025-26',
                        propertyTax: parseFloat(amount),
                        totalAmount: parseFloat(amount),
                        dueDate: new Date(dueDate),
                        status: 'pending'
                    }
                });
                break;
            }
            default:
                return res.status(400).json({ success: false, message: 'Invalid service type' });
        }

        res.status(201).json({ success: true, data: newBill });
    } catch (error) {
        console.error('createBill error:', error);
        res.status(500).json({ success: false, message: 'Failed to create bill' });
    }
};

exports.updateBill = async (req, res) => {
    const { id } = req.params;
    const { status, serviceType } = req.body;

    try {
        if (!serviceType) return res.status(400).json({ success: false, message: 'Service type required' });

        let updated;
        const type = serviceType.toUpperCase();

        if (type === 'ELECTRICITY') {
            updated = await prisma.electricityBill.update({ where: { billId: id }, data: { status } });
        } else if (type === 'WATER') {
            updated = await prisma.waterBill.update({ where: { billId: id }, data: { status } });
        } else if (type === 'GAS') {
            updated = await prisma.gasBill.update({ where: { billId: id }, data: { status } });
        } else if (type === 'MUNICIPAL') {
            updated = await prisma.municipalBill.update({ where: { billId: id }, data: { status } });
        }

        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('updateBill error:', error);
        res.status(500).json({ success: false, message: 'Failed to update bill' });
    }
};

// Alert Management
exports.getAlerts = async (req, res) => {
    try {
        const alerts = await prisma.alert.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: alerts });
    } catch (error) {
        console.error('getAlerts error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
    }
};

exports.createAlert = async (req, res) => {
    try {
        const { title, content, type, serviceType, alertType, active } = req.body;
        const alert = await prisma.alert.create({
            data: {
                title,
                message: content,
                severity: type,
                serviceType: serviceType.toUpperCase(),
                alertType: alertType || 'GENERAL',
                isActive: active !== undefined ? active : true,
                startsAt: new Date()
            }
        });
        res.status(201).json({ success: true, data: alert });
    } catch (error) {
        console.error('createAlert error:', error);
        res.status(500).json({ success: false, message: 'Failed to create alert' });
    }
};

exports.updateAlert = async (req, res) => {
    const { id } = req.params;
    const { title, content, type, active } = req.body;
    try {
        const alert = await prisma.alert.update({
            where: { alertId: id },
            data: {
                ...(title && { title }),
                ...(content && { message: content }),
                ...(type && { severity: type }),
                ...(active !== undefined && { isActive: active })
            }
        });
        res.json({ success: true, data: alert });
    } catch (error) {
        console.error('updateAlert error:', error);
        res.status(500).json({ success: false, message: 'Failed to update alert' });
    }
};

exports.deleteAlert = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.alert.delete({
            where: { alertId: id }
        });
        res.json({ success: true, message: 'Alert deleted successfully' });
    } catch (error) {
        console.error('deleteAlert error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete alert' });
    }
};

exports.getKiosks = async (req, res) => {
    try {
        const kiosks = await prisma.kiosk.findMany({
            orderBy: { id: 'asc' }
        });
        res.json({ success: true, data: kiosks });
    } catch (error) {
        console.error('getKiosks error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch kiosks' });
    }
};
