const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Authentication routes
router.post('/login', maintenanceController.login);
router.post('/credentials', maintenanceController.setCredentials);
router.get('/auth/status', maintenanceController.checkAuth);

// Ticket routes
router.get('/tickets', maintenanceController.getTickets);
router.get('/tickets/:ticketId', maintenanceController.getTicketDetails);
router.post('/tickets/:ticketId/respond', maintenanceController.respondToTicket);

module.exports = router;
