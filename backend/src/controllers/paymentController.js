const Razorpay = require('razorpay');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
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
                    billId,
                    amount: req.body.amount,
                    paymentMethod: 'ONLINE',
                    transactionId: razorpay_payment_id,
                    status: 'SUCCESS'
                }
            });

            // Update bill status
            await prisma.bill.update({
                where: { id: billId },
                data: { status: 'PAID' }
            });

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
        res.status(500).json({ success: false, message: error.message });
    }
};