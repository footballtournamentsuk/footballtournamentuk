-- Add banner_url field to tournaments table
ALTER TABLE public.tournaments 
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Create storage policies for tournament banners if they don't exist
DO $$
BEGIN
  -- Check if policies exist before creating them
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Tournament banners are publicly accessible'
  ) THEN
    CREATE POLICY "Tournament banners are publicly accessible" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'banners');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Users can upload tournament banners'
  ) THEN
    CREATE POLICY "Users can upload tournament banners" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Users can update their tournament banners'
  ) THEN
    CREATE POLICY "Users can update their tournament banners" 
    ON storage.objects 
    FOR UPDATE 
    USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Users can delete their tournament banners'
  ) THEN
    CREATE POLICY "Users can delete their tournament banners" 
    ON storage.objects 
    FOR DELETE 
    USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END
$$;