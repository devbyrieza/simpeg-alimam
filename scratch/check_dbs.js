const { Client } = require('pg');

async function checkDBs() {
    const client = new Client({
        connectionString: "postgresql://postgres:nhzYTBmfqk8RUhOoYHmvkbzoN2OhN@localhost:5433/postgres"
    });
    
    await client.connect();
    
    const res = await client.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
    console.log("Databases on 5433:", res.rows.map(r => r.datname));
    
    await client.end();
}

checkDBs().catch(console.error);
