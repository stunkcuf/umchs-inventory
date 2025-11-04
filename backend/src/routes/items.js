const express = require('express');
const router = express.Router();
const { getAllItems, getItem, createItem, updateItem, deleteItem } = require('../controllers/itemsController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', auth, getAllItems);
router.get('/:id', auth, getItem);
router.post('/', auth, requireRole(['admin', 'manager']), createItem);
router.put('/:id', auth, requireRole(['admin', 'manager']), updateItem);
router.delete('/:id', auth, requireRole(['admin']), deleteItem);

module.exports = router;
