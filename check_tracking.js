
const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function checkRLS() {
  try {
    await client.connect();
    const sql = fs.readFileSync('check_tracking_rls.sql', 'utf8');
    const res = await client.query(sql);
    fs.writeFileSync('tracking_results.json', JSON.stringify(res.rows, null, 2));
    console.log('Results written to tracking_results.json');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkRLS();
