const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

(async () => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE || 'ecommerce_db',
    });

    console.log("🔵 Connected to database. Preparing to add users...");

    // --- USER 1: Standard User ---
    const userEmail = 'user@gmail.com';
    const userPass = 'user1122';
    const userHash = await bcrypt.hash(userPass, 10);

    // --- USER 2: Admin User ---
    const adminEmail = 'admin@gmail.com';
    const adminPass = 'admin1122';
    const adminHash = await bcrypt.hash(adminPass, 10);

    // SQL Query
    const sql = `
      INSERT INTO users (id, email, password, name, role, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE password = VALUES(password), role = VALUES(role), name = VALUES(name);
    `;

    // Execute for User
    await connection.execute(sql, [
      'user_001',       // ID
      userEmail,        // Email
      userHash,         // Hashed Password
      'Test User',      // Name
      'user'            // Role
    ]);
    console.log(`✅ Added: ${userEmail} (Password: ${userPass})`);

    // Execute for Admin
    await connection.execute(sql, [
      'admin_002',      // ID
      adminEmail,       // Email
      adminHash,        // Hashed Password
      'Test Admin',     // Name
      'admin'           // Role
    ]);
    console.log(`✅ Added: ${adminEmail} (Password: ${adminPass})`);

  } catch (error) {
    console.error("❌ Error adding users:", error.message);
  } finally {
    if (connection) await connection.end();
    process.exit();
  }
})();