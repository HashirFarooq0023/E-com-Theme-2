import mysql from 'mysql2/promise';

// Create a connection pool to reuse connections
// Use global object to preserve pool across HMR reloads in development
// Use a distinct global key to ensure pool is recreated when this file changes
// (Previous pool might persist in memory with old settings during HMR)
const GLOBAL_POOL_KEY = 'mysqlPool_v4';

const pool = global[GLOBAL_POOL_KEY] || mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT || 4000,
  ssl: {
    rejectUnauthorized: true
  },
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  maxIdle: 0, // Critical: Close idle connections immediately to prevent ECONNRESET
  idleTimeout: 60000
});

if (process.env.NODE_ENV !== 'production') {
  global[GLOBAL_POOL_KEY] = pool;

  // Optional health check
  if (!global[GLOBAL_POOL_KEY + '_checked']) {
    pool.getConnection()
      .then((conn) => {
        console.log("Database Connected Successfully (Pool v4)");
        conn.release();
        global[GLOBAL_POOL_KEY + '_checked'] = true;
      })
      .catch((err) => {
        console.error(" MySQL Connection Failed:", err.message);
      });
  }
}

export default pool;