-- Create RLS policies for banners bucket uploads

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow admins to upload to banners bucket
CREATE POLICY "Admins can upload to banners bucket" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'banners' AND
  auth.uid() IS NOT NULL AND
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);

-- Allow admins to view banners bucket files
CREATE POLICY "Admins can view banners bucket files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'banners' AND
  auth.uid() IS NOT NULL AND
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);

-- Allow admins to delete from banners bucket
CREATE POLICY "Admins can delete from banners bucket" ON storage.objects
FOR DELETE USING (
  bucket_id = 'banners' AND
  auth.uid() IS NOT NULL AND
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);

-- Also create policies for logos bucket
CREATE POLICY "Admins can upload to logos bucket" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'logos' AND
  auth.uid() IS NOT NULL AND
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can view logos bucket files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'logos' AND
  auth.uid() IS NOT NULL AND
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can delete from logos bucket" ON storage.objects
FOR DELETE USING (
  bucket_id = 'logos' AND
  auth.uid() IS NOT NULL AND
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);

-- And for share-covers bucket
CREATE POLICY "Admins can upload to share-covers bucket" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'share-covers' AND
  auth.uid() IS NOT NULL AND
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can view share-covers bucket files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'share-covers' AND
  auth.uid() IS NOT NULL AND
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can delete from share-covers bucket" ON storage.objects
FOR DELETE USING (
  bucket_id = 'share-covers' AND
  auth.uid() IS NOT NULL AND
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);