const { Client } = require('pg');
require('dotenv').config();
const fs = require('fs');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function getScoutId() {
  try {
    await client.connect();
    const res = await client.query('SELECT id FROM scouts ORDER BY created_at DESC LIMIT 1');
    if (res.rows.length > 0) {
      fs.writeFileSync('last_scout_id.txt', res.rows[0].id);
      console.log('ID wrote to file');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

getScoutId();
