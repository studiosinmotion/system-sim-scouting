
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = 'https://rmtyebyzitzgkplxvzxg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2qDg3Jssg_fTPdXl_3Ku-g_1yOkdJ3i';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSchema() {
    console.log('Checking schema for "tracking_events"...');
    
    // Check if we can select the columns we interact with
    const { data, error } = await supabase
        .from('tracking_events')
        .select('scout_id, event_type, meta_data')
        .limit(1);

    if (error) {
        console.error('Schema Check Failed:', error.message);
        console.log('Details:', error);
    } else {
        console.log('Schema Check Passed: Columns exist.');
        console.log('Sample data:', data);
    }
}

checkSchema();
