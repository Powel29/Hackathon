const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Request new connection
router.post('/new', verifyToken, connectionController.requestNewConnection);

// Track connection status
router.get('/track/:applicationId', verifyToken, connectionController.trackConnectionStatus);

// Get my applications
router.get('/', verifyToken, connectionController.getMyApplications);

module.exports = router;
