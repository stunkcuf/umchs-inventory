const db = require('../config/database');

// Get inventory by location
const getInventoryByLocation = (req, res) => {
  const { location_id } = req.params;

  const sql = `
    SELECT i.*, it.name, it.description, it.sku, it.category, it.unit,
           it.min_stock, it.max_stock, it.reorder_point, it.unit_price
    FROM inventory i
    JOIN items it ON i.item_id = it.id
    WHERE i.location_id = ?
    ORDER BY it.name
  `;

  db.all(sql, [location_id], (err, inventory) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(inventory);
  });
};

// Get all inventory across all locations
const getAllInventory = (req, res) => {
  const sql = `
    SELECT i.*, it.name, it.description, it.sku, it.category, it.unit,
           it.min_stock, it.max_stock, it.reorder_point, it.unit_price,
           l.name as location_name
    FROM inventory i
    JOIN items it ON i.item_id = it.id
    JOIN locations l ON i.location_id = l.id
    ORDER BY it.name, l.name
  `;

  db.all(sql, [], (err, inventory) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(inventory);
  });
};

// Update inventory quantity
const updateInventory = (req, res) => {
  const { item_id, location_id, quantity, overstock_quantity } = req.body;

  if (!item_id || !location_id) {
    return res.status(400).json({ error: 'Item ID and Location ID are required' });
  }

  const sql = `
    INSERT INTO inventory (item_id, location_id, quantity, overstock_quantity, last_updated)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(item_id, location_id)
    DO UPDATE SET
      quantity = ?,
      overstock_quantity = ?,
      last_updated = CURRENT_TIMESTAMP
  `;

  db.run(sql, [item_id, location_id, quantity || 0, overstock_quantity || 0, quantity || 0, overstock_quantity || 0], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Create transaction record
    const transactionSql = `
      INSERT INTO transactions (item_id, location_id, transaction_type, quantity, performed_by, notes)
      VALUES (?, ?, 'adjustment', ?, ?, 'Inventory adjustment')
    `;

    db.run(transactionSql, [item_id, location_id, quantity, req.user.id], (err) => {
      if (err) {
        console.error('Error creating transaction:', err);
      }
    });

    res.json({ message: 'Inventory updated successfully' });
  });
};

// Adjust inventory (add/remove stock)
const adjustInventory = (req, res) => {
  const { item_id, location_id, quantity_change, transaction_type, notes } = req.body;

  if (!item_id || !location_id || quantity_change === undefined) {
    return res.status(400).json({ error: 'Item ID, Location ID, and quantity change are required' });
  }

  // Get current inventory
  const getSql = 'SELECT quantity FROM inventory WHERE item_id = ? AND location_id = ?';
  db.get(getSql, [item_id, location_id], (err, inv) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const currentQty = inv ? inv.quantity : 0;
    const newQty = currentQty + quantity_change;

    if (newQty < 0) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const updateSql = `
      INSERT INTO inventory (item_id, location_id, quantity, last_updated)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(item_id, location_id)
      DO UPDATE SET
        quantity = ?,
        last_updated = CURRENT_TIMESTAMP
    `;

    db.run(updateSql, [item_id, location_id, newQty, newQty], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Create transaction record
      const transactionSql = `
        INSERT INTO transactions (item_id, location_id, transaction_type, quantity, performed_by, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.run(transactionSql, [item_id, location_id, transaction_type || 'adjustment', quantity_change, req.user.id, notes], (err) => {
        if (err) {
          console.error('Error creating transaction:', err);
        }
      });

      res.json({ message: 'Inventory adjusted successfully', new_quantity: newQty });
    });
  });
};

// Get low stock items
const getLowStockItems = (req, res) => {
  const { location_id } = req.query;

  let sql = `
    SELECT i.*, it.name, it.description, it.sku, it.category, it.unit,
           it.min_stock, it.max_stock, it.reorder_point, l.name as location_name
    FROM inventory i
    JOIN items it ON i.item_id = it.id
    JOIN locations l ON i.location_id = l.id
    WHERE i.quantity <= it.reorder_point
  `;

  const params = [];
  if (location_id) {
    sql += ' AND i.location_id = ?';
    params.push(location_id);
  }

  sql += ' ORDER BY it.name';

  db.all(sql, params, (err, items) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(items);
  });
};

// Get overstock items
const getOverstockItems = (req, res) => {
  const { location_id } = req.query;

  let sql = `
    SELECT i.*, it.name, it.description, it.sku, it.category, it.unit,
           it.min_stock, it.max_stock, it.reorder_point, l.name as location_name
    FROM inventory i
    JOIN items it ON i.item_id = it.id
    JOIN locations l ON i.location_id = l.id
    WHERE it.max_stock IS NOT NULL AND (i.quantity + i.overstock_quantity) > it.max_stock
  `;

  const params = [];
  if (location_id) {
    sql += ' AND i.location_id = ?';
    params.push(location_id);
  }

  sql += ' ORDER BY it.name';

  db.all(sql, params, (err, items) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(items);
  });
};

module.exports = {
  getInventoryByLocation,
  getAllInventory,
  updateInventory,
  adjustInventory,
  getLowStockItems,
  getOverstockItems
};
