const mysql = require('mysql2/promise');

async function checkMySQL() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'password123' // default password often used in docker-compose
        });
        
        const [rows, fields] = await connection.execute('SHOW DATABASES');
        console.log("MySQL Databases:");
        console.log(rows.map(r => r.Database));
        await connection.end();
    } catch (e) {
        console.log("Failed to connect with root/password123:", e.message);
    }
}

checkMySQL();
