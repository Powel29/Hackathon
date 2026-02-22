const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const accountRequestController = require('../controllers/accountRequestController');

// Complaints routes
router.get('/complaints', adminController.getComplaints);
router.put('/complaints/:id', adminController.updateComplaint);

// Connections routes
router.get('/connections', adminController.getConnections);
router.put('/connections/:id', adminController.updateConnection);

// Bills routes
router.get('/bills', adminController.getBills);
router.put('/bills/:id', adminController.updateBill);

// Services Requests routes
router.get('/requests', adminController.getRequests);
router.put('/requests/:id', adminController.updateRequest);

// Account Approval routes
router.get('/account-requests', accountRequestController.getPendingRequests);
router.post('/account-requests/:id/approve', accountRequestController.approveRequest);
router.post('/account-requests/:id/reject', accountRequestController.rejectRequest);

// Login route (mock simple auth if needed, but here we just return success since frontend checks ADMIN_CREDENTIALS)
router.post('/login', (req, res) => {
    // Real auth could check against db
    res.json({ success: true, token: 'fake-admin-token' });
});

module.exports = router;
