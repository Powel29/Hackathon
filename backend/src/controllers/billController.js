const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get user bills
exports.getUserBills = async (req, res) => {
    try {
        const bills = await prisma.bill.findMany({
            where: { userId: req.user.userId },
            include: { payments: true },
            orderBy: { dueDate: 'desc' }
        });

        res.json({ success: true, bills });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get bill by number
exports.getBillByNumber = async (req, res) => {
    try {
        const { billNumber } = req.params;

        const bill = await prisma.bill.findUnique({
            where: { billNumber },
            include: { payments: true }
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