const MaintenanceService = require('../services/maintenanceService');
const db = require('../config/database');

// Store maintenance service instances per user
const serviceInstances = new Map();

function getServiceInstance(userId) {
  if (!serviceInstances.has(userId)) {
    serviceInstances.set(userId, new MaintenanceService());
  }
  return serviceInstances.get(userId);
}

// Store credentials securely
exports.setCredentials = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const userId = req.user.id;

    // Store encrypted credentials in database
    // For simplicity, we're storing them. In production, use encryption!
    db.run(
      `INSERT OR REPLACE INTO maintenance_credentials (user_id, maintenance_username, maintenance_password)
       VALUES (?, ?, ?)`,
      [userId, username, password],
      (err) => {
        if (err) {
          console.error('Error storing credentials:', err);
          return res.status(500).json({ error: 'Failed to store credentials' });
        }

        res.json({ success: true, message: 'Credentials stored successfully' });
      }
    );
  } catch (error) {
    console.error('Set credentials error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Login to maintenance system
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const userId = req.user.id;
    const service = getServiceInstance(userId);

    await service.login(username, password);

    // Store credentials for future use
    db.run(
      `INSERT OR REPLACE INTO maintenance_credentials (user_id, maintenance_username, maintenance_password)
       VALUES (?, ?, ?)`,
      [userId, username, password],
      (err) => {
        if (err) {
          console.error('Error storing credentials:', err);
        }
      }
    );

    res.json({ success: true, message: 'Logged in successfully' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
};

// Auto-login using stored credentials
async function ensureLoggedIn(userId, service) {
  if (service.authenticated) {
    return true;
  }

  return new Promise((resolve, reject) => {
    db.get(
      'SELECT maintenance_username, maintenance_password FROM maintenance_credentials WHERE user_id = ?',
      [userId],
      async (err, row) => {
        if (err || !row) {
          reject(new Error('No stored credentials found. Please login first.'));
          return;
        }

        try {
          await service.login(row.maintenance_username, row.maintenance_password);
          resolve(true);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

// Get all tickets
exports.getTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const service = getServiceInstance(userId);

    await ensureLoggedIn(userId, service);

    const tickets = await service.getTickets();
    res.json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get ticket details
exports.getTicketDetails = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;
    const service = getServiceInstance(userId);

    await ensureLoggedIn(userId, service);

    const ticket = await service.getTicketDetails(ticketId);
    res.json(ticket);
  } catch (error) {
    console.error('Get ticket details error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Respond to a ticket
exports.respondToTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const userId = req.user.id;
    const service = getServiceInstance(userId);

    await ensureLoggedIn(userId, service);

    const result = await service.respondToTicket(ticketId, message);
    res.json(result);
  } catch (error) {
    console.error('Respond to ticket error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Check authentication status
exports.checkAuth = async (req, res) => {
  try {
    const userId = req.user.id;

    db.get(
      'SELECT maintenance_username FROM maintenance_credentials WHERE user_id = ?',
      [userId],
      (err, row) => {
        if (err || !row) {
          return res.json({ authenticated: false });
        }
        res.json({ authenticated: true, username: row.maintenance_username });
      }
    );
  } catch (error) {
    console.error('Check auth error:', error);
    res.status(500).json({ error: error.message });
  }
};
