const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function getScoutId() {
  try {
    await client.connect();
    const res = await client.query('SELECT id FROM scouts ORDER BY created_at DESC LIMIT 1');
    if (res.rows.length > 0) {
      console.log('LATEST_SCOUT_ID=' + res.rows[0].id);
    } else {
      console.log('NO_SCOUTS_FOUND');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

getScoutId();
