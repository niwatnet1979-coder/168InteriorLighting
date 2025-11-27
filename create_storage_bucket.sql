-- ========================================
-- STEP 1: Create Storage Bucket for Team Documents
-- ========================================
-- Create a new private bucket named 'team-documents'
INSERT INTO storage.buckets (id, name, public)
VALUES ('team-documents', 'team-documents', false) ON CONFLICT (id) DO NOTHING;
-- ========================================
-- STEP 2: Set up Security Policies (RLS)
-- ========================================
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated view" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
-- Policy: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'team-documents');
-- Policy: Allow authenticated users to view files
CREATE POLICY "Allow authenticated view" ON storage.objects FOR
SELECT TO authenticated USING (bucket_id = 'team-documents');
-- Policy: Allow authenticated users to update their files
CREATE POLICY "Allow authenticated updates" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id = 'team-documents');
-- Policy: Allow authenticated users to delete files
CREATE POLICY "Allow authenticated deletes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'team-documents');