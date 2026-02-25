const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const prisma = require("../config/prisma");

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const BILL_MODEL_MAP = {
    SERVICE: { model: "bill", paymentField: "billId" },
    ELECTRICITY: { model: "electricityBill", paymentField: "electricityBillId" },
    GAS: { model: "gasBill", paymentField: "gasBillId" },
    WATER: { model: "waterBill", paymentField: "waterBillId" },
    MUNICIPAL: { model: "municipalBill", paymentField: "municipalBillId" },
};

// Create Order
router.post("/create-order", async (req, res) => {
    try {
        const { amount, billId, billType } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Invalid amount" });
        }

        // Prevent double payment by checking current status
        if (billId) {
            try {
                const billRecord = await getBillById(billId, billType);
                if (billRecord && isPaidStatus(billRecord.bill.status)) {
                    return res.status(400).json({ error: "Bill is already paid" });
                }
            } catch (err) {
                // If bill lookup fails (e.g. invalid UUID for demo bills), continue
                console.warn("Bill lookup skipped:", err.message);
            }
        }

        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // paise
            currency: "INR",
            receipt: "rcpt_" + Date.now(),
        });

        res.json(order);
    } catch (err) {
        console.error("create-order error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Verify payment callback from frontend
router.post("/verify-payment", async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        billId,
        billType,
        amount,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        console.error("Signature mismatch");
        return res.status(400).json({ success: false, error: "Invalid payment signature" });
    }

    if (billId) {
        try {
            await markBillAsPaid(
                billId,
                billType || "",
                razorpay_payment_id,
                Number(amount || 0)
            );
            console.log(`Bill ${billId} marked as PAID. Ref: ${razorpay_payment_id}`);
        } catch (err) {
            console.error("Failed to update bill in DB:", err.message);
            // Payment is captured but DB update failed; avoid user re-charge
            return res.json({
                success: true,
                warning: "Payment captured but DB update failed. Contact support.",
                transactionId: razorpay_payment_id,
            });
        }
    }

    res.json({ success: true, transactionId: razorpay_payment_id });
});

// Razorpay webhook (resilience fallback)
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (webhookSecret) {
            const signature = req.headers["x-razorpay-signature"];
            const expectedSig = crypto
                .createHmac("sha256", webhookSecret)
                .update(req.body)
                .digest("hex");
            if (signature !== expectedSig) {
                return res.status(400).json({ error: "Invalid webhook signature" });
            }
        }

        const event = JSON.parse(req.body);

        if (event.event === "payment.captured") {
            const payment = event.payload.payment.entity;
            console.log("Webhook: payment.captured", payment.id);
        }

        res.json({ status: "ok" });
    } catch (err) {
        console.error("Webhook error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

async function getBillById(billId, billType) {
    const normalizedType = normalizeBillType(billType);

    if (normalizedType) {
        const target = BILL_MODEL_MAP[normalizedType];
        const bill = await prisma[target.model].findUnique({ where: { billId } });
        return bill ? { bill, type: normalizedType } : null;
    }

    // Fallback when frontend does not send bill type
    for (const type of Object.keys(BILL_MODEL_MAP)) {
        const target = BILL_MODEL_MAP[type];
        const bill = await prisma[target.model].findUnique({ where: { billId } });
        if (bill) return { bill, type };
    }

    return null;
}

async function markBillAsPaid(billId, billType, transactionRef, amount) {
    const billRecord = await getBillById(billId, billType);
    if (!billRecord) {
        throw new Error(`Bill not found for update: ${billId}`);
    }

    const target = BILL_MODEL_MAP[billRecord.type];
    const paymentData = {
        gateway: "razorpay",
        transactionRef,
        amount,
        status: "SUCCESS",
        billType: billRecord.type,
    };
    paymentData[target.paymentField] = billId;

    await prisma.$transaction([
        prisma[target.model].update({
            where: { billId },
            data: { status: "PAID" },
        }),
        prisma.payment.create({ data: paymentData }),
    ]);
}

function normalizeBillType(billType = "") {
    const value = String(billType).trim().toUpperCase();
    return BILL_MODEL_MAP[value] ? value : "";
}

function isPaidStatus(status = "") {
    return String(status).trim().toUpperCase() === "PAID";
}

module.exports = router;
