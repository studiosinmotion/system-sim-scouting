
const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function applyFix() {
  try {
    await client.connect();
    console.log('Applying fix_tracking_rls.sql...');
    const sql = fs.readFileSync('fix_tracking_rls.sql', 'utf8');
    await client.query(sql);
    console.log('Fix applied successfully!');
  } catch (err) {
    console.error('Error applying fix:', err);
  } finally {
    await client.end();
  }
}

applyFix();
