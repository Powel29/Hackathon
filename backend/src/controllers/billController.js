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

        // 3. Fetch OTHER Bills (Gas, Water, Municipal) - Placeholder for now
        // const gasBills = ...

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
            } : {}
        });

        let allBills = [
            ...genericBills.map(b => formatBill(b, 'SERVICE')),
            ...electricityBills.map(b => formatBill(b, 'ELECTRICITY'))
        ];

        // Filter by serviceType if provided
        if (serviceType) {
            allBills = allBills.filter(bill => {
                if (serviceType === 'ELECTRICITY') return bill.type === 'ELECTRICITY';
                if (serviceType === 'GAS') return bill.type === 'GAS' || bill.type === 'SERVICE';
                if (serviceType === 'WATER') return bill.type === 'WATER' || bill.type === 'SERVICE';
                if (serviceType === 'MUNICIPAL') return bill.type === 'MUNICIPAL' || bill.type === 'SERVICE';
                return bill.type === serviceType || bill.type === 'SERVICE';
            });
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