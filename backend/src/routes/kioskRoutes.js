const express = require('express');
const router = express.Router();
const kioskController = require('../controllers/kioskController');

// Public endpoint for Kiosk heartbeat
router.post('/heartbeat', kioskController.heartbeat);

module.exports = router;
