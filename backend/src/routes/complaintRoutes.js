const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const complaintController = require('../controllers/complaintController');
const { verifyToken } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateRequest');
const upload = require('../middlewares/fileUpload');

// Get complaint types
router.get(
    '/types',
    [
        query('serviceType')
            .isIn(['ELECTRICITY', 'GAS', 'WATER', 'MUNICIPAL'])
            .withMessage('Invalid service type')
    ],
    validate,
    complaintController.getComplaintTypes
);

// Register new complaint
router.post(
    '/',
    verifyToken,
    [
        body('serviceType')
            .isIn(['ELECTRICITY', 'GAS', 'WATER', 'MUNICIPAL'])
            .withMessage('Invalid service type'),
        body('complaintType')
            .notEmpty()
            .withMessage('Complaint type is required'),
        body('description')
            .trim()
            .isLength({ min: 20, max: 2000 })
            .withMessage('Description must be between 20 and 2000 characters'),
        body('title')
            .optional()
            .trim()
            .isLength({ max: 200 }),
        body('location')
            .optional()
            .trim(),
        body('latitude')
            .optional()
            .isFloat({ min: -90, max: 90 }),
        body('longitude')
            .optional()
            .isFloat({ min: -180, max: 180 })
    ],
    validate,
    complaintController.registerComplaint
);

// Get my complaints
router.get('/', verifyToken, complaintController.getMyComplaints);

// Get complaint details
router.get('/:complaintId', verifyToken, complaintController.getComplaintDetails);

// Track complaint (public endpoint)
router.get('/track/:complaintId', complaintController.trackComplaint);

// Upload document
router.post(
    '/:complaintId/upload',
    verifyToken,
    upload.single('document'),
    complaintController.uploadDocument
);

module.exports = router;
