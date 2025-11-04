require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../src/config/database');

const createAdminUser = async () => {
  const username = 'admin';
  const email = 'admin@example.com';
  const password = 'admin123';
  const role = 'admin';

  try {
    const hash = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';

    db.run(sql, [username, email, hash, role], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          console.log('✓ Admin user already exists');
        } else {
          console.error('Error creating admin user:', err.message);
        }
      } else {
        console.log('✓ Admin user created successfully');
        console.log('  Username: admin');
        console.log('  Password: admin123');
        console.log('  Email: admin@example.com');
      }
      db.close();
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdminUser();
