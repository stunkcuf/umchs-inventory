const db = require('../config/database');

// Get all budgets
const getAllBudgets = (req, res) => {
  const { location_id, fiscal_year } = req.query;

  let sql = `
    SELECT b.*, l.name as location_name
    FROM budgets b
    JOIN locations l ON b.location_id = l.id
    WHERE 1=1
  `;
  const params = [];

  if (location_id) {
    sql += ' AND b.location_id = ?';
    params.push(location_id);
  }

  if (fiscal_year) {
    sql += ' AND b.fiscal_year = ?';
    params.push(fiscal_year);
  }

  sql += ' ORDER BY b.fiscal_year DESC, l.name';

  db.all(sql, params, (err, budgets) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(budgets);
  });
};

// Get single budget
const getBudget = (req, res) => {
  const sql = `
    SELECT b.*, l.name as location_name
    FROM budgets b
    JOIN locations l ON b.location_id = l.id
    WHERE b.id = ?
  `;

  db.get(sql, [req.params.id], (err, budget) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.json(budget);
  });
};

// Create budget
const createBudget = (req, res) => {
  const { location_id, department, total_amount, fiscal_year, start_date, end_date } = req.body;

  if (!location_id || !total_amount || !fiscal_year) {
    return res.status(400).json({ error: 'Location, total amount, and fiscal year are required' });
  }

  const sql = `
    INSERT INTO budgets (location_id, department, total_amount, fiscal_year, start_date, end_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [location_id, department, total_amount, fiscal_year, start_date, end_date], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, message: 'Budget created successfully' });
  });
};

// Update budget
const updateBudget = (req, res) => {
  const { location_id, department, total_amount, spent_amount, fiscal_year, start_date, end_date } = req.body;

  const sql = `
    UPDATE budgets
    SET location_id = ?, department = ?, total_amount = ?, spent_amount = ?,
        fiscal_year = ?, start_date = ?, end_date = ?
    WHERE id = ?
  `;

  db.run(sql, [location_id, department, total_amount, spent_amount, fiscal_year, start_date, end_date, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.json({ message: 'Budget updated successfully' });
  });
};

// Delete budget
const deleteBudget = (req, res) => {
  const sql = 'DELETE FROM budgets WHERE id = ?';
  db.run(sql, [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.json({ message: 'Budget deleted successfully' });
  });
};

// Get budget summary
const getBudgetSummary = (req, res) => {
  const { location_id } = req.params;

  const sql = `
    SELECT
      b.*,
      l.name as location_name,
      (b.total_amount - b.spent_amount) as remaining_amount,
      ROUND((b.spent_amount * 100.0 / b.total_amount), 2) as percent_spent
    FROM budgets b
    JOIN locations l ON b.location_id = l.id
    WHERE b.location_id = ?
    ORDER BY b.fiscal_year DESC
  `;

  db.all(sql, [location_id], (err, budgets) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(budgets);
  });
};

module.exports = {
  getAllBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetSummary
};
