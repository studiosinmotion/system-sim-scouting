
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = 'https://rmtyebyzitzgkplxvzxg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2qDg3Jssg_fTPdXl_3Ku-g_1yOkdJ3i'; // Anon Key

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SCOUT_ID = '0e13eb93-b8fa-4801-a800-13a4ce596be2';

async function verify() {
    console.log('Checking ID:', SCOUT_ID);
    
    // Check Scout Name
    const { data: scout, error: scoutError } = await supabase
        .from('scouts')
        .select('name, email')
        .eq('id', SCOUT_ID)
        .single();
    
    if (scoutError) console.error('Scout Error:', scoutError);
    else console.log('Scout Data:', scout);

    // Check Stats
    const { count, error: statsError } = await supabase
        .from('invites')
        .select('id', { count: 'exact', head: false })
        .eq('scout_id', SCOUT_ID);

    if (statsError) console.error('Stats Error:', statsError);
    else console.log('Stats Count:', count);
}

verify();
