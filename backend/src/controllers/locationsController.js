const db = require('../config/database');

// Get all locations
const getAllLocations = (req, res) => {
  const sql = 'SELECT * FROM locations ORDER BY name';
  db.all(sql, [], (err, locations) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(locations);
  });
};

// Get single location
const getLocation = (req, res) => {
  const sql = 'SELECT * FROM locations WHERE id = ?';
  db.get(sql, [req.params.id], (err, location) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(location);
  });
};

// Create location
const createLocation = (req, res) => {
  const { name, address, type, manager_id } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Location name is required' });
  }

  const sql = 'INSERT INTO locations (name, address, type, manager_id) VALUES (?, ?, ?, ?)';
  db.run(sql, [name, address, type, manager_id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, message: 'Location created successfully' });
  });
};

// Update location
const updateLocation = (req, res) => {
  const { name, address, type, manager_id } = req.body;

  const sql = 'UPDATE locations SET name = ?, address = ?, type = ?, manager_id = ? WHERE id = ?';
  db.run(sql, [name, address, type, manager_id, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json({ message: 'Location updated successfully' });
  });
};

// Delete location
const deleteLocation = (req, res) => {
  const sql = 'DELETE FROM locations WHERE id = ?';
  db.run(sql, [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json({ message: 'Location deleted successfully' });
  });
};

module.exports = { getAllLocations, getLocation, createLocation, updateLocation, deleteLocation };
