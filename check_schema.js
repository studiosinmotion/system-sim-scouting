
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = 'https://rmtyebyzitzgkplxvzxg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2qDg3Jssg_fTPdXl_3Ku-g_1yOkdJ3i';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSchema() {
    console.log('Checking schema for "invites"...');
    
    // Try to insert a dummy row with new columns (and immediately fail or rollback, 
    // but actually just selecting * and seeing the structure is harder via client without introspection).
    // Easiest way: Try to Select the new columns.
    
    const { data, error } = await supabase
        .from('invites')
        .select('first_name, last_name, phone')
        .limit(1);

    if (error) {
        console.error('Schema Check Failed:', error.message);
        console.log('CONCLUSION: The V2 SQL Script has likely NOT been run.');
    } else {
        console.log('Schema Check Passed: Columns exist.');
    }
}

checkSchema();
