-- Fix RLS policies for share-covers bucket

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload share covers" ON storage.objects;
DROP POLICY IF EXISTS "Users can view share covers" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own share covers" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own share covers" ON storage.objects;

-- Create comprehensive RLS policies for share-covers bucket
CREATE POLICY "Anyone can view share covers" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'share-covers');

CREATE POLICY "Authenticated users can upload share covers" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'share-covers' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update share covers" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'share-covers' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete share covers" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'share-covers' 
  AND auth.role() = 'authenticated'
);