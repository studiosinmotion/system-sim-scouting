const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const LANDING_PAGE_URL = 'http://localhost:3000/test_page.html';

async function seedData() {
  try {
    await client.connect();
    console.log('Connected to database.');

    // 1. Create Tenant
    const tenantRes = await client.query(`
      INSERT INTO tenants (name, settings)
      VALUES ($1, $2)
      RETURNING id;
    `, ['Power Gym Berlin', '{}']);
    const tenantId = tenantRes.rows[0].id;
    console.log('Tenant created:', tenantId);

    // 2. Create Campaign
    const campaignRes = await client.query(`
      INSERT INTO campaigns (tenant_id, name, landingpage_url, status)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `, [tenantId, '7 Tage Friends Pass', LANDING_PAGE_URL, 'active']);
    const campaignId = campaignRes.rows[0].id;
    console.log('Campaign created:', campaignId);

    // 3. Create Scout
    const scoutRes = await client.query(`
      INSERT INTO scouts (tenant_id, email, name, stats)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `, [tenantId, 'max.mustermann@example.com', 'Max Mustermann', '{}']);
    const scoutId = scoutRes.rows[0].id;
    
    console.log('\n---------------------------------------------------');
    console.log('SEEDING SUCCESSFUL!');
    console.log('---------------------------------------------------');
    console.log('NEW SCOUT UUID:', scoutId);
    console.log('---------------------------------------------------');

  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await client.end();
  }
}

seedData();
