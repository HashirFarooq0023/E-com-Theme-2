// scripts/setup.js
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  let connection;

  try {
    console.log("🔵 Connecting to MySQL...");

    // 1. Connect to MySQL Server
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: process.env.MYSQL_PORT || 4000,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      }
    });

    const DB_NAME = process.env.MYSQL_DATABASE;

    // 2. Create Database
    console.log(`🔵 Creating Database '${DB_NAME}' if needed...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await connection.query(`USE \`${DB_NAME}\`;`);

    // 3. Create USERS Table
    console.log("🔵 Creating 'users' table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255),
        password VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 4. Create ADDRESSES Table (For User Profiles)
    console.log("🔵 Creating 'addresses' table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone1 VARCHAR(20) NOT NULL,
        phone2 VARCHAR(20),
        house_no VARCHAR(255),
        street VARCHAR(255),
        area VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        province VARCHAR(100) NOT NULL,
        landmark TEXT,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        -- Link to Users Table
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // 5. Create PRODUCTS Table
    console.log("🔵 Creating 'products' table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(255),
        image LONGTEXT,
        images LONGTEXT,
        description LONGTEXT,
        stock INT DEFAULT 0,
        rating DECIMAL(3, 2) DEFAULT 0,
        highlights LONGTEXT, -- Added to support your new Product Details page chips
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 6. Create ORDERS Table
    console.log("🔵 Creating 'orders' table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        
        user_id VARCHAR(255), -- Nullable (Guest checkout = NULL)
        address_id INT,       -- Nullable (Link to saved address if User logged in)
        
        customer_email VARCHAR(255),
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        
        items JSON,           -- Stores the products bought
        shipping_address JSON, -- Stores the snapshot of the address (For Guests & History)
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        -- Foreign Keys
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL
      );
    `);

    // 7. Create SITE_SETTINGS Table (NEW)
    console.log("🔵 Creating 'site_settings' table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INT PRIMARY KEY, -- We only use ID 1
        brand_name VARCHAR(255) DEFAULT 'My Brand',
        brand_description TEXT,
        logo_url LONGTEXT,
        email_address VARCHAR(255),
        helpline_number VARCHAR(50),
        whatsapp_number VARCHAR(50),
        facebook_url TEXT,
        instagram_url TEXT,
        tiktok_url TEXT,
        snapchat_url TEXT,
        domain_name VARCHAR(255) DEFAULT '',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 8. Create HERO_SLIDES Table (NEW)
    console.log("🔵 Creating 'hero_slides' table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS hero_slides (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image_url LONGTEXT NOT NULL,
        site_id INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. Insert Default Settings Row (NEW)
    // using INSERT IGNORE so it doesn't fail if the row already exists
    console.log("🔵 Initializing default site settings...");
    await connection.query(`
      INSERT IGNORE INTO site_settings (id, brand_name, brand_description, logo_url, email_address, domain_name)
      VALUES (1, 'My Awesome Brand', 'Quality products delivered fast.', '', 'support@brand.com', '');
    `);

    console.log("✅ SUCCESS: Database and all tables (Users, Addresses, Products, Orders, Settings) created!");

  } catch (error) {
    console.error("❌ ERROR:", error.message);
  } finally {
    if (connection) await connection.end();
  }
}

setupDatabase();