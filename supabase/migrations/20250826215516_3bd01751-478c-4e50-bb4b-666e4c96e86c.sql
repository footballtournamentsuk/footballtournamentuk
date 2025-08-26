-- Create a security definer function to check admin role for storage
CREATE OR REPLACE FUNCTION public.is_storage_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    auth.uid() IS NOT NULL AND
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
  );
END;
$$;

-- Create RLS policies for storage buckets using the function
CREATE POLICY "Admins can upload to banners bucket" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'banners' AND public.is_storage_admin()
);

CREATE POLICY "Admins can view banners bucket files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'banners' AND public.is_storage_admin()
);

CREATE POLICY "Admins can delete from banners bucket" ON storage.objects
FOR DELETE USING (
  bucket_id = 'banners' AND public.is_storage_admin()
);

-- Policies for logos bucket
CREATE POLICY "Admins can upload to logos bucket" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'logos' AND public.is_storage_admin()
);

CREATE POLICY "Admins can view logos bucket files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'logos' AND public.is_storage_admin()
);

CREATE POLICY "Admins can delete from logos bucket" ON storage.objects
FOR DELETE USING (
  bucket_id = 'logos' AND public.is_storage_admin()
);

-- Policies for share-covers bucket  
CREATE POLICY "Admins can upload to share-covers bucket" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'share-covers' AND public.is_storage_admin()
);

CREATE POLICY "Admins can view share-covers bucket files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'share-covers' AND public.is_storage_admin()
);

CREATE POLICY "Admins can delete from share-covers bucket" ON storage.objects
FOR DELETE USING (
  bucket_id = 'share-covers' AND public.is_storage_admin()
);