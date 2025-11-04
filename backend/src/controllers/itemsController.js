const db = require('../config/database');

// Get all items
const getAllItems = (req, res) => {
  const { category, search } = req.query;
  let sql = 'SELECT * FROM items WHERE 1=1';
  const params = [];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    sql += ' AND (name LIKE ? OR description LIKE ? OR sku LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  sql += ' ORDER BY name';

  db.all(sql, params, (err, items) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(items);
  });
};

// Get single item
const getItem = (req, res) => {
  const sql = 'SELECT * FROM items WHERE id = ?';
  db.get(sql, [req.params.id], (err, item) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  });
};

// Create item
const createItem = (req, res) => {
  const { name, description, sku, category, unit, min_stock, max_stock, reorder_point, unit_price } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Item name is required' });
  }

  const sql = `INSERT INTO items (name, description, sku, category, unit, min_stock, max_stock, reorder_point, unit_price)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(sql, [name, description, sku, category, unit || 'unit', min_stock || 0, max_stock, reorder_point, unit_price || 0], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, message: 'Item created successfully' });
  });
};

// Update item
const updateItem = (req, res) => {
  const { name, description, sku, category, unit, min_stock, max_stock, reorder_point, unit_price } = req.body;

  const sql = `UPDATE items SET name = ?, description = ?, sku = ?, category = ?, unit = ?,
               min_stock = ?, max_stock = ?, reorder_point = ?, unit_price = ? WHERE id = ?`;

  db.run(sql, [name, description, sku, category, unit, min_stock, max_stock, reorder_point, unit_price, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item updated successfully' });
  });
};

// Delete item
const deleteItem = (req, res) => {
  const sql = 'DELETE FROM items WHERE id = ?';
  db.run(sql, [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  });
};

module.exports = { getAllItems, getItem, createItem, updateItem, deleteItem };
