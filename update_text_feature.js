const { Client } = require("pg");
require("dotenv").config();

// Configuration
const TENANT_ID = '79a37c78-7bdf-45e4-a631-fb47926d054d';
const SCOUTING_TEXT = "Hey! Ich schenke dir 7 Tage Training im Power Gym. Mach mit: {{link}}";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function updateDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error("Error: DATABASE_URL is not set in environment variables or .env file.");
    console.log("Please set DATABASE_URL to your Supabase connection string (postgres://...).");
    console.log("Alternatively, run the following SQL manually in Supabase SQL Editor:");
    console.log(`
      ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS scouting_text TEXT;
      UPDATE campaigns SET scouting_text = '${SCOUTING_TEXT}' WHERE tenant_id = '${TENANT_ID}';
    `);
    process.exit(1);
  }

  try {
    await client.connect();
    console.log("Connected to database...");

    // Step 1: Add column
    console.log("Step 1: Adding 'scouting_text' column to 'campaigns' table...");
    await client.query(`
      ALTER TABLE campaigns 
      ADD COLUMN IF NOT EXISTS scouting_text TEXT;
    `);
    console.log("Column 'scouting_text' check/creation successful.");

    // Step 2: Update existing campaign
    console.log(`Step 2: Updating campaign for Tenant ID: ${TENANT_ID}...`);
    const res = await client.query(`
      UPDATE campaigns 
      SET scouting_text = $1 
      WHERE tenant_id = $2
    `, [SCOUTING_TEXT, TENANT_ID]);
    
    console.log(`Rows updated: ${res.rowCount}`);
    console.log("Database update complete.");

  } catch (err) {
    console.error("Error updating database:", err);
  } finally {
    await client.end();
  }
}

updateDatabase();
