
-- ==========================================
-- UPGRADE SCRIPT VERSION 2: Data Quality & Tracking
-- ==========================================

-- 1. Modify Table: scouts
-- Remove the old single 'name' column
ALTER TABLE scouts DROP COLUMN IF EXISTS name;

-- Add split name columns
ALTER TABLE scouts ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE scouts ADD COLUMN IF NOT EXISTS last_name TEXT;

-- 2. Modify Table: invites
-- Add structured columns for lead data
ALTER TABLE invites ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE invites ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE invites ADD COLUMN IF NOT EXISTS phone TEXT;

-- Optional: You can drop 'lead_data' if you don't need it anymore, 
-- or keep it as backup.
-- ALTER TABLE invites DROP COLUMN IF EXISTS lead_data;

-- 3. Create New Table: tracking_events
CREATE TABLE IF NOT EXISTS tracking_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    scout_id UUID REFERENCES scouts(id) ON DELETE SET NULL, -- Keep event even if scout is deleted? Or CASCADE? 'nullable' implies SET NULL or just optional.
    event_type TEXT NOT NULL, -- e.g. 'share_whatsapp', 'page_view'
    meta_data JSONB DEFAULT '{}'
);

-- 4. Security / RLS for tracking_events
-- Enable RLS
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to INSERT events (e.g. from the Scout App)
CREATE POLICY "Allow public insert for tracking"
ON tracking_events
FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Allow public to READ (optional, maybe not needed for the app itself, but good for testing)
-- CREATE POLICY "Allow public read for tracking"
-- ON tracking_events
-- FOR SELECT
-- TO public
-- USING (true);
