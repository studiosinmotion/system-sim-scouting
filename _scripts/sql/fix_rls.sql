
-- Enable RLS
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Create Policy for reading (counting) invites
-- Allow anyone (anon) to read invites where they know the scout_id?
-- Actually, for stats, we just need to count.
-- Let's allow public read for now to fix the blockage.
CREATE POLICY "Allow public read access"
ON invites
FOR SELECT
TO public
USING (true);

-- Allow inserting (for the widget)
CREATE POLICY "Allow public insert access"
ON invites
FOR INSERT
TO public
WITH CHECK (true);
