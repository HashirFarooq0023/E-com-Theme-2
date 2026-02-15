import mysql from 'mysql2/promise';

// Create a connection pool to reuse connections
// Use global object to preserve pool across HMR reloads in development
const pool = global.mysqlPool || mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

if (process.env.NODE_ENV !== 'production') {
  global.mysqlPool = pool;

  // Optional health check
  // Only run if we just created the pool (not verified on every HMR to reduce log noise)
  if (!global.mysqlPoolChecked) {
    pool.getConnection()
      .then((conn) => {
        console.log("Database Connected Successfully (Singleton)");
        conn.release();
        global.mysqlPoolChecked = true;
      })
      .catch((err) => {
        console.error(" MySQL Connection Failed:", err.message);
      });
  }
}

export default pool;