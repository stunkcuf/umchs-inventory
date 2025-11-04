const express = require('express');
const router = express.Router();
const { getAllRequests, getRequest, createRequest, updateRequestStatus, fulfillRequest } = require('../controllers/requestsController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', auth, getAllRequests);
router.get('/:id', auth, getRequest);
router.post('/', auth, createRequest);
router.patch('/:id/status', auth, requireRole(['admin', 'manager']), updateRequestStatus);
router.post('/:id/fulfill', auth, requireRole(['admin', 'manager']), fulfillRequest);

module.exports = router;
