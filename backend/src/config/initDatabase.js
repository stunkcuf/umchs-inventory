require('dotenv').config();
const db = require('./database');

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          location_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (location_id) REFERENCES locations(id)
        )
      `);

      // Locations table
      db.run(`
        CREATE TABLE IF NOT EXISTS locations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          address TEXT,
          type TEXT,
          manager_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Items/Supplies table
      db.run(`
        CREATE TABLE IF NOT EXISTS items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          sku TEXT UNIQUE,
          category TEXT,
          unit TEXT DEFAULT 'unit',
          min_stock INTEGER DEFAULT 0,
          max_stock INTEGER,
          reorder_point INTEGER,
          unit_price REAL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Inventory table (stock by location)
      db.run(`
        CREATE TABLE IF NOT EXISTS inventory (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          item_id INTEGER NOT NULL,
          location_id INTEGER NOT NULL,
          quantity INTEGER DEFAULT 0,
          overstock_quantity INTEGER DEFAULT 0,
          last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (item_id) REFERENCES items(id),
          FOREIGN KEY (location_id) REFERENCES locations(id),
          UNIQUE(item_id, location_id)
        )
      `);

      // Budgets table
      db.run(`
        CREATE TABLE IF NOT EXISTS budgets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          location_id INTEGER NOT NULL,
          department TEXT,
          total_amount REAL NOT NULL,
          spent_amount REAL DEFAULT 0,
          fiscal_year INTEGER NOT NULL,
          start_date DATE,
          end_date DATE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (location_id) REFERENCES locations(id)
        )
      `);

      // Purchase Orders table
      db.run(`
        CREATE TABLE IF NOT EXISTS purchase_orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          po_number TEXT UNIQUE NOT NULL,
          location_id INTEGER NOT NULL,
          budget_id INTEGER,
          vendor TEXT,
          total_amount REAL DEFAULT 0,
          status TEXT DEFAULT 'pending',
          ordered_by INTEGER NOT NULL,
          order_date DATE DEFAULT CURRENT_DATE,
          received_date DATE,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (location_id) REFERENCES locations(id),
          FOREIGN KEY (budget_id) REFERENCES budgets(id),
          FOREIGN KEY (ordered_by) REFERENCES users(id)
        )
      `);

      // Purchase Order Items table
      db.run(`
        CREATE TABLE IF NOT EXISTS purchase_order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          po_id INTEGER NOT NULL,
          item_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          unit_price REAL NOT NULL,
          total_price REAL NOT NULL,
          received_quantity INTEGER DEFAULT 0,
          FOREIGN KEY (po_id) REFERENCES purchase_orders(id),
          FOREIGN KEY (item_id) REFERENCES items(id)
        )
      `);

      // Item Requests table (locations requesting items)
      db.run(`
        CREATE TABLE IF NOT EXISTS item_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          item_id INTEGER NOT NULL,
          requesting_location_id INTEGER NOT NULL,
          requested_by INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          priority TEXT DEFAULT 'normal',
          status TEXT DEFAULT 'pending',
          reason TEXT,
          approved_by INTEGER,
          approved_date DATETIME,
          fulfilled_date DATETIME,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (item_id) REFERENCES items(id),
          FOREIGN KEY (requesting_location_id) REFERENCES locations(id),
          FOREIGN KEY (requested_by) REFERENCES users(id),
          FOREIGN KEY (approved_by) REFERENCES users(id)
        )
      `);

      // Transactions table (stock movements)
      db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          item_id INTEGER NOT NULL,
          location_id INTEGER NOT NULL,
          transaction_type TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          reference_id INTEGER,
          reference_type TEXT,
          performed_by INTEGER NOT NULL,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (item_id) REFERENCES items(id),
          FOREIGN KEY (location_id) REFERENCES locations(id),
          FOREIGN KEY (performed_by) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating tables:', err);
          reject(err);
        } else {
          console.log('All tables created successfully');
          resolve();
        }
      });
    });
  });
};

// Run initialization if this file is executed directly
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('Database initialized successfully');
      db.close();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to initialize database:', err);
      process.exit(1);
    });
}

module.exports = initDatabase;
