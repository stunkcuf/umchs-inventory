const db = require('../config/database');

// Get all purchase orders
const getAllPurchaseOrders = (req, res) => {
  const { location_id, status } = req.query;

  let sql = `
    SELECT po.*, l.name as location_name, u.username as ordered_by_name
    FROM purchase_orders po
    JOIN locations l ON po.location_id = l.id
    JOIN users u ON po.ordered_by = u.id
    WHERE 1=1
  `;
  const params = [];

  if (location_id) {
    sql += ' AND po.location_id = ?';
    params.push(location_id);
  }

  if (status) {
    sql += ' AND po.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY po.created_at DESC';

  db.all(sql, params, (err, orders) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(orders);
  });
};

// Get single purchase order with items
const getPurchaseOrder = (req, res) => {
  const orderSql = `
    SELECT po.*, l.name as location_name, u.username as ordered_by_name,
           b.department, b.fiscal_year
    FROM purchase_orders po
    JOIN locations l ON po.location_id = l.id
    JOIN users u ON po.ordered_by = u.id
    LEFT JOIN budgets b ON po.budget_id = b.id
    WHERE po.id = ?
  `;

  db.get(orderSql, [req.params.id], (err, order) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!order) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    // Get order items
    const itemsSql = `
      SELECT poi.*, i.name, i.description, i.sku, i.unit
      FROM purchase_order_items poi
      JOIN items i ON poi.item_id = i.id
      WHERE poi.po_id = ?
    `;

    db.all(itemsSql, [req.params.id], (err, items) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ ...order, items });
    });
  });
};

// Create purchase order
const createPurchaseOrder = (req, res) => {
  const { po_number, location_id, budget_id, vendor, items, notes } = req.body;

  if (!po_number || !location_id || !items || items.length === 0) {
    return res.status(400).json({ error: 'PO number, location, and items are required' });
  }

  // Calculate total amount
  const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  const orderSql = `
    INSERT INTO purchase_orders (po_number, location_id, budget_id, vendor, total_amount, status, ordered_by, notes)
    VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
  `;

  db.run(orderSql, [po_number, location_id, budget_id, vendor, total_amount, req.user.id, notes], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const po_id = this.lastID;

    // Insert order items
    const itemSql = `
      INSERT INTO purchase_order_items (po_id, item_id, quantity, unit_price, total_price)
      VALUES (?, ?, ?, ?, ?)
    `;

    let itemsInserted = 0;
    items.forEach((item) => {
      const total_price = item.quantity * item.unit_price;
      db.run(itemSql, [po_id, item.item_id, item.quantity, item.unit_price, total_price], (err) => {
        if (err) {
          console.error('Error inserting order item:', err);
        }
        itemsInserted++;

        if (itemsInserted === items.length) {
          // Update budget if provided
          if (budget_id) {
            const updateBudgetSql = 'UPDATE budgets SET spent_amount = spent_amount + ? WHERE id = ?';
            db.run(updateBudgetSql, [total_amount, budget_id]);
          }

          res.status(201).json({ id: po_id, message: 'Purchase order created successfully' });
        }
      });
    });
  });
};

// Update purchase order status
const updatePurchaseOrderStatus = (req, res) => {
  const { status, received_date } = req.body;

  const sql = 'UPDATE purchase_orders SET status = ?, received_date = ? WHERE id = ?';
  db.run(sql, [status, received_date, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    // If received, update inventory
    if (status === 'received') {
      const itemsSql = 'SELECT * FROM purchase_order_items WHERE po_id = ?';
      db.all(itemsSql, [req.params.id], (err, items) => {
        if (err) {
          console.error('Error fetching PO items:', err);
          return res.json({ message: 'Purchase order updated but inventory not updated' });
        }

        // Get PO location
        const poSql = 'SELECT location_id FROM purchase_orders WHERE id = ?';
        db.get(poSql, [req.params.id], (err, po) => {
          if (err || !po) {
            console.error('Error fetching PO:', err);
            return res.json({ message: 'Purchase order updated but inventory not updated' });
          }

          // Update inventory for each item
          items.forEach((item) => {
            const invSql = `
              INSERT INTO inventory (item_id, location_id, quantity, last_updated)
              VALUES (?, ?, ?, CURRENT_TIMESTAMP)
              ON CONFLICT(item_id, location_id)
              DO UPDATE SET
                quantity = quantity + ?,
                last_updated = CURRENT_TIMESTAMP
            `;

            db.run(invSql, [item.item_id, po.location_id, item.quantity, item.quantity], (err) => {
              if (err) {
                console.error('Error updating inventory:', err);
              }

              // Create transaction
              const transSql = `
                INSERT INTO transactions (item_id, location_id, transaction_type, quantity, reference_id, reference_type, performed_by, notes)
                VALUES (?, ?, 'receive', ?, ?, 'purchase_order', ?, 'Received from PO')
              `;
              db.run(transSql, [item.item_id, po.location_id, item.quantity, req.params.id, req.user.id]);
            });
          });

          res.json({ message: 'Purchase order updated and inventory adjusted' });
        });
      });
    } else {
      res.json({ message: 'Purchase order status updated successfully' });
    }
  });
};

module.exports = {
  getAllPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePurchaseOrderStatus
};
