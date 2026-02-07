
const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    await client.connect();
    const sql = fs.readFileSync('check_all_rls.sql', 'utf8');
    const queries = sql.split(';').filter(q => q.trim());
    
    for (const q of queries) {
        console.log('--- Query ---');
        console.log(q.trim());
        const res = await client.query(q);
        console.table(res.rows);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
