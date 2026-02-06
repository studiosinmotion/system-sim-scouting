const { Client } = require("pg");
require("dotenv").config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function setupDatabase() {
  try {
    await client.connect();
    console.log("Connected to database.");

    // Enable UUID extension if not already enabled (though gen_random_uuid() is often built-in)
    // await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // Tenants
    await client.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('Table "tenants" checked/created.');

    // Campaigns
    await client.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        landingpage_url TEXT,
        form_config JSONB DEFAULT '{}',
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('Table "campaigns" checked/created.');

    // Scouts
    await client.query(`
      CREATE TABLE IF NOT EXISTS scouts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        stats JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('Table "scouts" checked/created.');

    // Invites
    await client.query(`
      CREATE TABLE IF NOT EXISTS invites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        scout_id UUID REFERENCES scouts(id) ON DELETE CASCADE,
        campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
        lead_data JSONB DEFAULT '{}',
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('Table "invites" checked/created.');

    console.log("All tables created/verified successfully.");
  } catch (err) {
    console.error("Error setting up database:", err);
  } finally {
    await client.end();
  }
}

setupDatabase();
