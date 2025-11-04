const express = require('express');
const router = express.Router();
const { getAllPurchaseOrders, getPurchaseOrder, createPurchaseOrder, updatePurchaseOrderStatus } = require('../controllers/purchaseOrdersController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', auth, getAllPurchaseOrders);
router.get('/:id', auth, getPurchaseOrder);
router.post('/', auth, requireRole(['admin', 'manager']), createPurchaseOrder);
router.patch('/:id/status', auth, requireRole(['admin', 'manager']), updatePurchaseOrderStatus);

module.exports = router;
