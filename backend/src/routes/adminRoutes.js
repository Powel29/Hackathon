const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const accountRequestController = require('../controllers/accountRequestController');
const { login, verifyToken } = require('../controllers/adminAuthController');

// ─── Auth (public) ────────────────────────────────────────────────────────────
router.post('/login', login);

// ─── All routes below require a valid admin JWT ───────────────────────────────
router.use(verifyToken);

// Complaints routes
router.get('/complaints', adminController.getComplaints);
router.put('/complaints/:id', adminController.updateComplaint);

// Citizens routes
router.get('/citizens/search', adminController.searchCitizens);

// Connections routes
router.get('/connections', adminController.getConnections);
router.put('/connections/:id', adminController.updateConnection);

// Bills routes
router.get('/bills', adminController.getBills);
router.post('/bills', adminController.createBill);
router.put('/bills/:id', adminController.updateBill);

// Services Requests routes
router.get('/requests', adminController.getRequests);
router.put('/requests/:id', adminController.updateRequest);

// Account Approval routes
router.get('/account-requests', accountRequestController.getPendingRequests);
router.post('/account-requests/:id/approve', accountRequestController.approveRequest);
router.post('/account-requests/:id/reject', accountRequestController.rejectRequest);

// Alerts routes
router.get('/alerts', adminController.getAlerts);
router.post('/alerts', adminController.createAlert);
router.put('/alerts/:id', adminController.updateAlert);
router.delete('/alerts/:id', adminController.deleteAlert);

// Kiosk Monitoring
router.get('/kiosks', adminController.getKiosks);

module.exports = router;
