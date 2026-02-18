const express = require('express');
const router = express.Router();
const serviceRequestController = require('../controllers/serviceRequestController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Validations would ideally go here with express-validator

// Create a new service request
router.post('/', verifyToken, serviceRequestController.createServiceRequest);

// Get a specific service request
router.get('/:requestId', verifyToken, serviceRequestController.getServiceRequest);

// Get all my service requests
router.get('/', verifyToken, serviceRequestController.getMyServiceRequests);

module.exports = router;
