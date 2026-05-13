-- Storage Policies for Creative Works Bucket
-- These policies allow authenticated users to upload and everyone to read

-- Note: RLS on storage.objects is already enabled by Supabase
-- We only need to create the policies

-- Allow authenticated users to upload files to creative-works bucket
DROP POLICY IF EXISTS "Allow authenticated upload" ON storage.objects;
CREATE POLICY "Allow authenticated upload" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'creative-works'
    AND auth.role() = 'authenticated'
  );

-- Allow everyone to read files from creative-works bucket
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'creative-works');

-- Allow authenticated users to update their own files
DROP POLICY IF EXISTS "Allow authenticated update" ON storage.objects;
CREATE POLICY "Allow authenticated update" ON storage.objects
  FOR UPDATE 
  USING (
    bucket_id = 'creative-works'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (STRING_TO_ARRAY(name, '/'))[1]
  )
  WITH CHECK (
    bucket_id = 'creative-works'
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete their own files
DROP POLICY IF EXISTS "Allow authenticated delete" ON storage.objects;
CREATE POLICY "Allow authenticated delete" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'creative-works'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (STRING_TO_ARRAY(name, '/'))[1]
  );
