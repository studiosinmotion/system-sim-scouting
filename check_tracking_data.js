
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = 'https://rmtyebyzitzgkplxvzxg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2qDg3Jssg_fTPdXl_3Ku-g_1yOkdJ3i';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkData() {
    console.log('Checking "tracking_events" table...');
    
    const { data, error, count } = await supabase
        .from('tracking_events')
        .select('*', { count: 'exact' });

    if (error) {
        console.error('Error fetching data:', error);
    } else {
        console.log(`Total events found: ${count}`);
        console.table(data);
        
        if (data.length > 0) {
            console.log('Sample event:', data[0]);
        }
    }
}

checkData();
