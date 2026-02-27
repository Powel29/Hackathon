const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const serviceAccountController = require('../controllers/serviceAccountController');
const { verifyToken } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateRequest');

// Get all service accounts
router.get('/', verifyToken, serviceAccountController.getServiceAccounts);

// Link new service account
router.post(
    '/link',
    verifyToken,
    [
        body('serviceType')
            .isIn(['ELECTRICITY', 'GAS', 'WATER', 'MUNICIPAL'])
            .withMessage('Invalid service type'),
        body('accountNumber')
            .trim()
            .notEmpty()
            .withMessage('Account number is required')
    ],
    validate,
    serviceAccountController.linkServiceAccount
);

// Get specific account details
router.get('/:accountId', verifyToken, serviceAccountController.getServiceAccountDetails);

module.exports = router;
