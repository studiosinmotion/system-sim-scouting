
const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    await client.connect();
    const sql = fs.readFileSync('fix_all_rls.sql', 'utf8');
    await client.query(sql);
    console.log('RLS policies applied for scouts and campaigns.');
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
