const prisma = require('../utils/prismaClient');

// Get user bills
// Get user bills
exports.getUserBills = async (req, res) => {
    try {
        const userId = req.user.citizenId; // Citizen ID / Aadhar from JWT
        const { serviceType } = req.query;

        // 1. Fetch Generic SERVICE Bills
        let genericBills = [];
        if (!serviceType || serviceType !== 'ELECTRICITY') {
            genericBills = await prisma.bill.findMany({
                where: {
                    account: { citizenId: userId }
                },
                include: { payments: true },
                orderBy: { dueDate: 'desc' }
            });
        }

        // 2. Fetch ELECTRICITY Bills (via ElectricityAccount -> Citizen)
        let electricityBills = [];
        if (!serviceType || serviceType === 'ELECTRICITY') {
            electricityBills = await prisma.electricityBill.findMany({
                where: {
                    account: { citizenId: userId }
                },
                include: { payments: true },
                orderBy: { dueDate: 'desc' }
            });
        }

        // 3. Fetch OTHER Bills
        let gasBills = [];
        if (!serviceType || serviceType === 'GAS') {
            gasBills = await prisma.gasBill.findMany({
                where: { account: { citizenId: userId } },
                include: { payments: true },
                orderBy: { dueDate: 'desc' }
            });
        }

        let waterBills = [];
        if (!serviceType || serviceType === 'WATER') {
            waterBills = await prisma.waterBill.findMany({
                where: { account: { citizenId: userId } },
                include: { payments: true },
                orderBy: { dueDate: 'desc' }
            });
        }

        let municipalBills = [];
        if (!serviceType || serviceType === 'MUNICIPAL') {
            municipalBills = await prisma.municipalBill.findMany({
                where: { account: { citizenId: userId } },
                include: { payments: true },
                orderBy: { dueDate: 'desc' }
            });
        }

        // 4. Normalize and Merge
        const formatBill = (bill, type) => ({
            id: bill.billId, // Common ID field
            billNumber: bill.billNumber || `GEN-${bill.billId.substr(0, 8)}`,
            amount: bill.totalAmount || bill.amount,
            dueDate: bill.dueDate,
            status: bill.status,
            type: type,
            billingPeriod: bill.billingPeriod,
            // Add specific fields if needed
            details: type === 'ELECTRICITY' ? {
                units: bill.unitsConsumed,
                readings: { current: bill.currentReading, previous: bill.previousReading }
            } : type === 'GAS' ? {
                units: bill.unitsConsumed,
                readings: { current: bill.currentReading, previous: bill.previousReading }
            } : type === 'WATER' ? {
                units: bill.unitsConsumed,
                readings: { current: bill.currentReading, previous: bill.previousReading }
            } : type === 'MUNICIPAL' ? {
                taxYear: bill.financialYear,
                propertyTax: bill.propertyTax
            } : {}
        });

        let allBills = [
            ...genericBills.map(b => formatBill(b, 'SERVICE')),
            ...electricityBills.map(b => formatBill(b, 'ELECTRICITY')),
            ...gasBills.map(b => formatBill(b, 'GAS')),
            ...waterBills.map(b => formatBill(b, 'WATER')),
            ...municipalBills.map(b => formatBill(b, 'MUNICIPAL'))
        ];

        // Filter by serviceType if provided - redundant if we fetched correctly but good for safety
        if (serviceType) {
            allBills = allBills.filter(bill => bill.type === serviceType || bill.type === 'SERVICE');
        }
        // Sort combined list by due date
        allBills.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));

        res.json({
            success: true,
            bills: allBills
        });

    } catch (error) {
        console.error('Get user bills error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bills',
            error: error.message
        });
    }
};

// Get bill by number
exports.getBillByNumber = async (req, res) => {
    try {
        const { billNumber } = req.params;

        const bill = await prisma.bill.findUnique({
            where: { billNumber },
            include: {
                payments: true,
                electricityBill: true,
                gasBill: true,
                waterBill: true,
                municipalBill: true
            }
        });

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: 'Bill not found'
            });
        }

        res.json({ success: true, bill });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.payBill = async (req, res) => {
    try {
        const { billId, serviceType } = req.body;

        if (!billId || !serviceType) {
            return res.status(400).json({ success: false, message: 'billId and serviceType are required' });
        }

        let updated;
        const type = serviceType.toUpperCase();

        if (type === 'ELECTRICITY') {
            updated = await prisma.electricityBill.update({ where: { billId }, data: { status: 'paid' } });
        } else if (type === 'WATER') {
            updated = await prisma.waterBill.update({ where: { billId }, data: { status: 'paid' } });
        } else if (type === 'GAS') {
            updated = await prisma.gasBill.update({ where: { billId }, data: { status: 'paid' } });
        } else if (type === 'MUNICIPAL') {
            updated = await prisma.municipalBill.update({ where: { billId }, data: { status: 'paid' } });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid service type' });
        }

        // Create a payment record
        await prisma.payment.create({
            data: {
                billId: null, // Unified bill table not used here currently
                amount: updated.totalAmount || updated.propertyTax,
                status: 'COMPLETED',
                billType: type,
                [type.toLowerCase() + 'BillId']: billId,
                gateway: 'KIOSK_CASH',
                transactionRef: `KIOSK-${Date.now()}`
            }
        });

        res.json({ success: true, data: updated });
    } catch (error) {
        console.error('payBill error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};