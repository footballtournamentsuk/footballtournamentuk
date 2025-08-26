-- Fix storage policies to allow public read access for public buckets
-- Also add tournament-attachments bucket policies

-- Drop existing restrictive policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can view banners bucket files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view logos bucket files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view share-covers bucket files" ON storage.objects;

-- Create public read policies for public buckets
CREATE POLICY "Public can view banners" ON storage.objects
FOR SELECT USING (bucket_id = 'banners');

CREATE POLICY "Public can view logos" ON storage.objects
FOR SELECT USING (bucket_id = 'logos');

CREATE POLICY "Public can view share-covers" ON storage.objects
FOR SELECT USING (bucket_id = 'share-covers');

CREATE POLICY "Public can view tournament-attachments" ON storage.objects
FOR SELECT USING (bucket_id = 'tournament-attachments');

-- Add tournament-attachments bucket admin policies
CREATE POLICY "Admins can upload to tournament-attachments bucket" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'tournament-attachments' AND public.is_storage_admin()
);

CREATE POLICY "Admins can delete from tournament-attachments bucket" ON storage.objects
FOR DELETE USING (
  bucket_id = 'tournament-attachments' AND public.is_storage_admin()
);