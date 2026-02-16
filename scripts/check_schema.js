require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function checkSchema() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            port: process.env.MYSQL_PORT || 3306,
            ssl: { rejectUnauthorized: false } // Relax SSL for inspection
        });

        console.log("Connected. Checking 'site_settings' schema...");
        const [rows] = await connection.execute(`DESCRIBE site_settings`);

        rows.forEach(row => {
            if (row.Field === 'logo_url') {
                console.log(`Column: ${row.Field}, Type: ${row.Type}`);
            }
        });

        await connection.end();
    } catch (err) {
        console.error("Schema Check Failed:", err.message);
    }
}

checkSchema();
