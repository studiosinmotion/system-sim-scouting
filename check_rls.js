
const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function checkRLS() {
  try {
    await client.connect();
    const sql = fs.readFileSync('check_rls.sql', 'utf8');
    const res = await client.query(sql);
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkRLS();
