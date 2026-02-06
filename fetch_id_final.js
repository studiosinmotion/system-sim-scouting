const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: 'postgresql://postgres:gcg2nqu0jnz*atq8YJA@db.rmtyebyzitzgkplxvzxg.supabase.co:5432/postgres',
});

async function getScoutId() {
  try {
    await client.connect();
    const res = await client.query('SELECT id FROM scouts ORDER BY created_at DESC LIMIT 1');
    if (res.rows.length > 0) {
      fs.writeFileSync('scout_id_final.txt', res.rows[0].id);
      console.log('Done');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
    process.exit(0);
  }
}

getScoutId();
