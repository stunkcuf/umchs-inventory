const express = require('express');
const router = express.Router();
const {
  getInventoryByLocation,
  getAllInventory,
  updateInventory,
  adjustInventory,
  getLowStockItems,
  getOverstockItems
} = require('../controllers/inventoryController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', auth, getAllInventory);
router.get('/location/:location_id', auth, getInventoryByLocation);
router.get('/low-stock', auth, getLowStockItems);
router.get('/overstock', auth, getOverstockItems);
router.post('/update', auth, requireRole(['admin', 'manager']), updateInventory);
router.post('/adjust', auth, requireRole(['admin', 'manager']), adjustInventory);

module.exports = router;
