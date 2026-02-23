const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const departmentController = require('../controllers/departmentController');
const { verifyToken } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateRequest');

/**
 * POST /api/departments/verify
 * Public endpoint to verify department consumer number
 */
router.post(
    '/verify',
    [
        body('serviceType')
            .trim()
            .notEmpty()
            .withMessage('Service type is required')
            .isIn(['ELECTRICITY', 'GAS', 'WATER', 'MUNICIPAL', 'electricity', 'gas', 'water', 'municipal'])
            .withMessage('Invalid service type. Must be ELECTRICITY, GAS, WATER, or MUNICIPAL'),
        body('consumerNumber')
            .trim()
            .notEmpty()
            .withMessage('Consumer number is required')
            .isLength({ min: 8 })
            .withMessage('Consumer number must be at least 8 characters')
    ],
    validate,
    departmentController.verifyDepartmentAccount
);

/**
 * GET /api/departments/:serviceType/:consumerNumber
 * Protected endpoint to get full account details
 */
router.get(
    '/:serviceType/:consumerNumber',
    verifyToken,
    [
        param('serviceType')
            .isIn(['ELECTRICITY', 'GAS', 'WATER', 'MUNICIPAL', 'electricity', 'gas', 'water', 'municipal'])
            .withMessage('Invalid service type'),
        param('consumerNumber')
            .trim()
            .notEmpty()
            .withMessage('Consumer number is required')
    ],
    validate,
    departmentController.getDepartmentAccountDetails
);

/**
 * POST /api/departments/request-approval
 * Protected: citizen requests admin approval for a consumer number
 */
const accountRequestController = require('../controllers/accountRequestController');
router.post(
    '/request-approval',
    verifyToken,
    [
        body('serviceType')
            .trim()
            .notEmpty()
            .withMessage('serviceType is required'),
        body('consumerNumber')
            .trim()
            .notEmpty()
            .withMessage('consumerNumber is required')
    ],
    validate,
    accountRequestController.createRequest
);

module.exports = router;

