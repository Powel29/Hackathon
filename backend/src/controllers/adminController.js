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

exports.updateBill = async (req, res) => {
    // Placeholder - not yet implemented
    res.status(501).json({ success: false, message: 'Bill updates not yet implemented' });
};
