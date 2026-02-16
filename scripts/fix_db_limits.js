// scripts/fix_db_limits.js
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function fixLimits() {
    console.log("🔵 Connecting to MySQL...");
    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            port: process.env.MYSQL_PORT || 3306,
            ssl: { rejectUnauthorized: false } // Relaxed SSL for admin tasks
        });

        console.log("🔵 Attempting to increase max_allowed_packet to 100MB...");

        // Check current value
        const [rows] = await connection.query("SHOW VARIABLES LIKE 'max_allowed_packet'");
        console.log(`🔸 Current max_allowed_packet: ${rows[0].Value} bytes`);

        // Try to set global
        try {
            await connection.query("SET GLOBAL max_allowed_packet = 100 * 1024 * 1024");
            console.log("✅ SUCCESS: Set GLOBAL max_allowed_packet to 100MB");
            console.log("⚠️  NOTE: You may need to restart your MySQL server for this to take full effect for all new connections, or it might apply immediately depending on version.");
        } catch (e) {
            console.error("❌ FAILED to set GLOBAL max_allowed_packet.");
            console.error("   Reason:", e.message);
            console.error("   TIP: You are likely using a cloud DB (like TiDB) or lack SUPER privileges.");
            console.error("   SOLUTION: Please check your DB provider's console to increase 'max_allowed_packet' to at least 100MB.");
        }

        await connection.end();

    } catch (error) {
        console.error("❌ Connection Error:", error.message);
    }
}

fixLimits();
