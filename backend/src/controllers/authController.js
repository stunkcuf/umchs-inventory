const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const register = (req, res) => {
  const { username, email, password, role = 'user', location_id } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: 'Error hashing password' });
    }

    const sql = 'INSERT INTO users (username, email, password, role, location_id) VALUES (?, ?, ?, ?, ?)';
    db.run(sql, [username, email, hash, role, location_id], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Username or email already exists' });
        }
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        message: 'User registered successfully',
        userId: this.lastID
      });
    });
  });
};

const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const sql = 'SELECT * FROM users WHERE username = ?';
  db.get(sql, [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: 'Error checking password' });
      }

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role, location_id: user.location_id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          location_id: user.location_id
        }
      });
    });
  });
};

const getProfile = (req, res) => {
  const sql = 'SELECT id, username, email, role, location_id, created_at FROM users WHERE id = ?';
  db.get(sql, [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });
};

module.exports = { register, login, getProfile };
