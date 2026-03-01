const Razorpay = require('razorpay');
const prisma = require('../utils/prismaClient');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create payment order
exports.createPaymentOrder = async (req, res) => {
    try {
        const { billId, amount } = req.body;

        const order = await razorpay.orders.create({
            amount: amount * 100, // Convert to paise
            currency: 'INR',
            receipt: `bill_${billId}`
        });

        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Verify payment
exports.verifyPayment = async (req, res) => {
    try {
        const {
            billId,
            billType,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            amount,
            electricityBillId,
            gasBillId,
            municipalBillId,
            waterBillId
        } = req.body;

        // Verify signature
        const crypto = require('crypto');
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature === expectedSign) {
            // Update payment in database
            const payment = await prisma.payment.create({
                data: {
                    billId: billType === 'SERVICE' ? billId : null,
                    amount: amount,
                    gateway: 'RAZORPAY',
                    transactionRef: razorpay_payment_id,
                    status: 'SUCCESS',
                    billType: billType || 'SERVICE',
                    electricityBillId: electricityBillId || null,
                    gasBillId: gasBillId || null,
                    municipalBillId: municipalBillId || null,
                    waterBillId: waterBillId || null
                }
            });

            // Update bill status in correct table
            const type = (billType || 'SERVICE').toUpperCase();
            if (type === 'ELECTRICITY') {
                await prisma.electricityBill.update({
                    where: { billId: electricityBillId || billId },
                    data: { status: 'PAID' }
                });
            } else if (type === 'GAS') {
                await prisma.gasBill.update({
                    where: { billId: gasBillId || billId },
                    data: { status: 'PAID' }
                });
            } else if (type === 'WATER') {
                await prisma.waterBill.update({
                    where: { billId: waterBillId || billId },
                    data: { status: 'PAID' }
                });
            } else if (type === 'MUNICIPAL') {
                await prisma.municipalBill.update({
                    where: { billId: municipalBillId || billId },
                    data: { status: 'PAID' }
                });
            } else {
                await prisma.bill.update({
                    where: { billId: billId },
                    data: { status: 'PAID' }
                });
            }

            res.json({
                success: true,
                message: 'Payment successful',
                payment
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid signature'
            });
        }
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
