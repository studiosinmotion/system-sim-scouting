
const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function fixRLS() {
  try {
    await client.connect();
    const sql = fs.readFileSync('fix_rls.sql', 'utf8');
    await client.query(sql);
    console.log('RLS policies applied successfully.');
  } catch (err) {
    console.error('Error applying RLS:', err);
  } finally {
    await client.end();
  }
}

fixRLS();
