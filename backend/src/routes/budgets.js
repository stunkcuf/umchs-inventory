const express = require('express');
const router = express.Router();
const { getAllBudgets, getBudget, createBudget, updateBudget, deleteBudget, getBudgetSummary } = require('../controllers/budgetsController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', auth, getAllBudgets);
router.get('/:id', auth, getBudget);
router.get('/summary/:location_id', auth, getBudgetSummary);
router.post('/', auth, requireRole(['admin', 'manager']), createBudget);
router.put('/:id', auth, requireRole(['admin', 'manager']), updateBudget);
router.delete('/:id', auth, requireRole(['admin']), deleteBudget);

module.exports = router;
