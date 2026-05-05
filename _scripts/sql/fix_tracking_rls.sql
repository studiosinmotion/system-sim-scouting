
-- Enable RLS (just in case, though it is already on)
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone (public) to SELECT tracking events
-- This is needed for the dashboard (anon/authenticated) to read the stats
CREATE POLICY "Allow public select for tracking" ON tracking_events
    FOR SELECT
    TO public
    USING (true);

-- Grant SELECT permission to anon and authenticated roles
GRANT SELECT ON tracking_events TO anon;
GRANT SELECT ON tracking_events TO authenticated;
