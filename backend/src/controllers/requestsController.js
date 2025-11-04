const db = require('../config/database');

// Get all item requests
const getAllRequests = (req, res) => {
  const { location_id, status } = req.query;

  let sql = `
    SELECT r.*, i.name as item_name, i.sku, i.unit,
           l.name as location_name, u.username as requested_by_name
    FROM item_requests r
    JOIN items i ON r.item_id = i.id
    JOIN locations l ON r.requesting_location_id = l.id
    JOIN users u ON r.requested_by = u.id
    WHERE 1=1
  `;
  const params = [];

  if (location_id) {
    sql += ' AND r.requesting_location_id = ?';
    params.push(location_id);
  }

  if (status) {
    sql += ' AND r.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY r.created_at DESC';

  db.all(sql, params, (err, requests) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(requests);
  });
};

// Get single request
const getRequest = (req, res) => {
  const sql = `
    SELECT r.*, i.name as item_name, i.description, i.sku, i.unit,
           l.name as location_name, u.username as requested_by_name,
           u2.username as approved_by_name
    FROM item_requests r
    JOIN items i ON r.item_id = i.id
    JOIN locations l ON r.requesting_location_id = l.id
    JOIN users u ON r.requested_by = u.id
    LEFT JOIN users u2 ON r.approved_by = u2.id
    WHERE r.id = ?
  `;

  db.get(sql, [req.params.id], (err, request) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  });
};

// Create item request
const createRequest = (req, res) => {
  const { item_id, requesting_location_id, quantity, priority, reason } = req.body;

  if (!item_id || !requesting_location_id || !quantity) {
    return res.status(400).json({ error: 'Item, location, and quantity are required' });
  }

  const sql = `
    INSERT INTO item_requests (item_id, requesting_location_id, requested_by, quantity, priority, reason, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `;

  db.run(sql, [item_id, requesting_location_id, req.user.id, quantity, priority || 'normal', reason], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, message: 'Item request created successfully' });
  });
};

// Update request status
const updateRequestStatus = (req, res) => {
  const { status, notes } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  let sql = 'UPDATE item_requests SET status = ?, notes = ?';
  const params = [status, notes];

  if (status === 'approved') {
    sql += ', approved_by = ?, approved_date = CURRENT_TIMESTAMP';
    params.push(req.user.id);
  } else if (status === 'fulfilled') {
    sql += ', fulfilled_date = CURRENT_TIMESTAMP';
  }

  sql += ' WHERE id = ?';
  params.push(req.params.id);

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json({ message: 'Request status updated successfully' });
  });
};

// Fulfill request (move inventory)
const fulfillRequest = (req, res) => {
  const { source_location_id } = req.body;

  if (!source_location_id) {
    return res.status(400).json({ error: 'Source location is required' });
  }

  // Get request details
  const requestSql = 'SELECT * FROM item_requests WHERE id = ?';
  db.get(requestSql, [req.params.id], (err, request) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    if (request.status !== 'approved') {
      return res.status(400).json({ error: 'Request must be approved before fulfillment' });
    }

    // Check source inventory
    const invSql = 'SELECT quantity FROM inventory WHERE item_id = ? AND location_id = ?';
    db.get(invSql, [request.item_id, source_location_id], (err, inv) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!inv || inv.quantity < request.quantity) {
        return res.status(400).json({ error: 'Insufficient inventory at source location' });
      }

      // Decrease source inventory
      const decreaseSql = `
        UPDATE inventory
        SET quantity = quantity - ?, last_updated = CURRENT_TIMESTAMP
        WHERE item_id = ? AND location_id = ?
      `;
      db.run(decreaseSql, [request.quantity, request.item_id, source_location_id], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Increase destination inventory
        const increaseSql = `
          INSERT INTO inventory (item_id, location_id, quantity, last_updated)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(item_id, location_id)
          DO UPDATE SET
            quantity = quantity + ?,
            last_updated = CURRENT_TIMESTAMP
        `;
        db.run(increaseSql, [request.item_id, request.requesting_location_id, request.quantity, request.quantity], (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Update request status
          const updateSql = 'UPDATE item_requests SET status = ?, fulfilled_date = CURRENT_TIMESTAMP WHERE id = ?';
          db.run(updateSql, ['fulfilled', req.params.id], (err) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }

            // Create transaction records
            const transSql = `
              INSERT INTO transactions (item_id, location_id, transaction_type, quantity, reference_id, reference_type, performed_by, notes)
              VALUES (?, ?, ?, ?, ?, 'item_request', ?, ?)
            `;

            // Source transaction (removal)
            db.run(transSql, [request.item_id, source_location_id, 'transfer_out', -request.quantity, request.id, req.user.id, 'Transferred to fulfill request']);

            // Destination transaction (addition)
            db.run(transSql, [request.item_id, request.requesting_location_id, 'transfer_in', request.quantity, request.id, req.user.id, 'Received from transfer']);

            res.json({ message: 'Request fulfilled successfully' });
          });
        });
      });
    });
  });
};

module.exports = {
  getAllRequests,
  getRequest,
  createRequest,
  updateRequestStatus,
  fulfillRequest
};
