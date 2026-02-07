
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = 'https://rmtyebyzitzgkplxvzxg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_2qDg3Jssg_fTPdXl_3Ku-g_1yOkdJ3i';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Use a known valid scout ID from admin.html debug output or previous context
// For now, I'll fetch one first
const fs = require('fs');

async function simulateVisit() {
    const log = [];
    const logFile = 'simulation_log.json';
    
    try {
        log.push({ step: 'init', message: 'Starting simulation...' });
        
        // Test 1: Organic Visit (No Scout ID)
        log.push({ step: 'test_1', message: 'Inserting with scout_id: null' });
        const { error: err1 } = await supabase.from('tracking_events').insert({
            event_type: 'page_view',
            meta_data: { source: 'test_organic' }
        });
        
        if (err1) {
            log.push({ step: 'test_1_result', status: 'failed', error: err1 });
        } else {
            log.push({ step: 'test_1_result', status: 'success' });
        }

        // Test 2: Scout Visit
        log.push({ step: 'test_2', message: 'Fetching valid scout ID...' });
        const { data: scouts } = await supabase.from('scouts').select('id').limit(1);
        
        if (scouts && scouts.length > 0) {
            const scoutId = scouts[0].id;
            log.push({ step: 'test_2_insert', message: `Inserting with scout_id: ${scoutId}` });
            
            const { error: err2 } = await supabase.from('tracking_events').insert({
                scout_id: scoutId,
                event_type: 'page_view',
                meta_data: { source: 'test_scout' }
            });

            if (err2) {
                log.push({ step: 'test_2_result', status: 'failed', error: err2 });
            } else {
                log.push({ step: 'test_2_result', status: 'success' });
            }
        } else {
            log.push({ step: 'test_2_aborted', message: 'No scouts found' });
        }

    } catch (e) {
        log.push({ step: 'fatal_error', error: e.message });
    } finally {
        fs.writeFileSync(logFile, JSON.stringify(log, null, 2));
        console.log('Simulation complete. Log written to ' + logFile);
    }
}

simulateVisit();
