
-- Enable RLS for scouts
ALTER TABLE scouts ENABLE ROW LEVEL SECURITY;

-- Allow public read access for scouts (needed to fetch name)
CREATE POLICY "Allow public read access"
ON scouts
FOR SELECT
TO public
USING (true);

-- Allow public insert access for scouts (needed for registration)
CREATE POLICY "Allow public insert access"
ON scouts
FOR INSERT
TO public
WITH CHECK (true);

-- Enable RLS for campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Allow public read access for campaigns (needed for texts/settings)
CREATE POLICY "Allow public read access"
ON campaigns
FOR SELECT
TO public
USING (true);
