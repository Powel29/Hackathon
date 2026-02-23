const prisma = require('../config/prisma');
const generateSignedUrl = require('../services/s3Download.service');

// Keep the mapping logic simple to match frontend needs

// Helper to get citizen name safely
const getCitizenName = (citizen) => citizen ? citizen.fullName : 'Unknown';
const getCitizenMobile = (citizen) => citizen ? citizen.mobileNumber : 'Unknown';

exports.getComplaints = async (req, res) => {
    try {
        const complaints = await prisma.complaint.findMany({
            include: { citizen: true, statusHistory: true }
        });

        const formatted = complaints.map(c => ({
            id: c.complaintId,
            complaintId: c.complaintNumber || c.complaintId.split('-')[0], // Fallback if number is missing
            citizenName: getCitizenName(c.citizen),
            citizenMobile: getCitizenMobile(c.citizen),
            consumerId: c.citizenId, // using citizenId as consumerId for simplicity if mapping doesn't exist
            serviceType: c.serviceType.toLowerCase(),
            complaintType: c.complaintType,
            description: c.description,
            priority: c.priority.toLowerCase(),
            status: c.status.toLowerCase().replace(/\s+/g, '_'),
            location: c.location || '',
            assignedTo: c.assignedTo || '',
            adminNotes: c.resolutionNote || '',
            citizenUpdateMessage: '',
            attachments: [],
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            slaDeadline: new Date(new Date(c.createdAt).getTime() + 48 * 60 * 60 * 1000).toISOString(), // Mock SLA
            statusHistory: c.statusHistory.map(h => ({
                status: h.newStatus,
                timestamp: h.changedAt,
                note: h.notes || '',
                by: h.changedBy || 'System'
            }))
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
        const updateData = {};
        if (status) updateData.status = status;
        if (adminNotes) updateData.resolutionNote = adminNotes;
        if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

        const complaint = await prisma.complaint.update({
            where: { complaintId: id },
            data: updateData
        });

        if (status) {
            await prisma.complaintStatusHistory.create({
                data: {
                    complaintId: id,
                    newStatus: status,
                    changedBy: by || 'Admin',
                    notes: adminNotes || ''
                }
            });
        }

        res.json({ success: true, data: complaint });
    } catch (error) {
        console.error('updateComplaint error:', error);
        res.status(500).json({ success: false, message: 'Failed to update complaint' });
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
