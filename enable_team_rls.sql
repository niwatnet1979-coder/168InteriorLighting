-- ========================================
-- Enable RLS and Create Policies for Team Table
-- ========================================
-- Enable Row Level Security
ALTER TABLE "Team" ENABLE ROW LEVEL SECURITY;
-- Create Policy: Allow all operations for everyone (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Allow all operations on Team" ON "Team" FOR ALL USING (true) WITH CHECK (true);