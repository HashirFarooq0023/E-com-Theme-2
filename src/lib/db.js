import mysql from 'mysql2/promise';

// Create a connection pool to reuse connections (Faster & Better for Next.js)
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || 'ecommerce_db',
  waitForConnections: true,
  connectionLimit: 10, 
  queueLimit: 0,
  // Timeout settings to prevent ECONNABORTED errors
  connectTimeout: 60000, // 60 seconds to establish connection
  acquireTimeout: 60000, // 60 seconds to acquire connection from pool
  timeout: 60000, // 60 seconds query timeout
  // Enable keep-alive to prevent connection drops
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Optional: Test connection when the app starts (Dev mode only)
if (process.env.NODE_ENV !== 'production') {
  pool.getConnection()
    .then((conn) => {
      console.log("Database Connected Successfully");
      conn.release(); // Always put the connection back in the pool
    })
    .catch((err) => {
      console.error("❌ MySQL Connection Failed:", err.message);
    });
}

export default pool;