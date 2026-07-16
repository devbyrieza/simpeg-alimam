const mysql = require('mysql2/promise');

// wait it's postgres!
const { exec } = require('child_process');
exec('psql "postgresql://postgres:nhzYTBmfqk8RUhOoYHmvkbzoN2OhN@localhost:5433/postgres" -c "\\l"', (err, stdout, stderr) => {
    console.log(stdout);
});
