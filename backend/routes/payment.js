const express = require("express");
const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const prisma = require("../src/config/prisma");

const router = express.Router();

// Create Razorpay order
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify Razorpay payment
router.post("/verify-payment", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount,
    billId,
    billType
  } = req.body;

  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature === razorpay_signature) {
    // Save payment to DB
    try {
      await prisma.payment.create({
        data: {
          billId: billId,
          gateway: "razorpay",
          transactionRef: razorpay_payment_id,
          amount: amount,
          status: "SUCCESS",
          billType: billType,
        },
      });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  } else {
    res.status(400).json({ success: false });
  }
});


//===================================================== implement this once deployed

// Razorpay webhook for backend verification
// router.post("/webhook", express.json(), (req, res) => {
//   const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
//   const shasum = crypto.createHmac("sha256", secret);
//   shasum.update(JSON.stringify(req.body));
//   const digest = shasum.digest("hex");
//   if (digest === req.headers["x-razorpay-signature"]) {
//     console.log("Webhook verified");
//     // TODO: Add DB update logic for payment status if needed
//   }
//   res.json({ status: "ok" });
// });

module.exports = router;
