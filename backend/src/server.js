require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initDatabase = require('./config/initDatabase');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase().catch(console.error);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/purchase-orders', require('./routes/purchaseOrders'));
app.use('/api/requests', require('./routes/requests'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Inventory API is running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
