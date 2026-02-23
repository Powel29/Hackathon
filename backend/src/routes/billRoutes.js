const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Get user bills
router.get('/', verifyToken, billController.getUserBills);

// Get bill by number
router.get('/:billNumber', verifyToken, billController.getBillByNumber);

// Pay bill
router.post('/pay', verifyToken, billController.payBill);

module.exports = router;
