
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = 'https://rmtyebyzitzgkplxvzxg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2qDg3Jssg_fTPdXl_3Ku-g_1yOkdJ3i';
const TENANT_ID = '79a37c78-7bdf-45e4-a631-fb47926d054d';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyDashboard() {
    console.log('--- Verifying Dashboard Logic ---');
    
    // 1. Fetch Scouts for Tenant
    const { data: scouts, error: errScouts } = await supabase
        .from('scouts')
        .select('id, first_name, last_name, tenant_id')
        .eq('tenant_id', TENANT_ID);

    if (errScouts) {
        console.error('Error fetching scouts:', errScouts);
        return;
    }

    console.log(`Found ${scouts.length} scouts for tenant ${TENANT_ID}`);
    const scoutIds = scouts.map(s => s.id);
    
    if (scoutIds.length === 0) {
        console.log('No scouts found for this tenant. Traffic count will be 0.');
        return;
    }

    // 2. Count Tracking Events
    const { count, error: errTraffic } = await supabase
        .from('tracking_events')
        .select('id', { count: 'exact', head: true })
        .eq('event_type', 'page_view')
        .in('scout_id', scoutIds);

    if (errTraffic) {
        console.error('Error fetching traffic:', errTraffic);
        return;
    }

    console.log(`Dashboard Traffic Count Should Be: ${count}`);

    // Check actual data in table to compare
    const { count: totalData } = await supabase
        .from('tracking_events')
        .select('id', { count: 'exact', head: true });
        
    console.log(`Total rows in tracking_events (raw): ${totalData}`);
}

verifyDashboard();
