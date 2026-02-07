
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function countEvents() {
  try {
    await client.connect();
    const res = await client.query('SELECT count(*) FROM tracking_events');
    console.log('Total events in DB (Admin Check):', res.rows[0].count);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

countEvents();
