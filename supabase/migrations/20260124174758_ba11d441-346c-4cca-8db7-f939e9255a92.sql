-- Create storage bucket for tournament banners
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tournament-banners',
  'tournament-banners',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view tournament banners (public bucket)
CREATE POLICY "Tournament banners are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'tournament-banners');

-- Allow authenticated users to upload tournament banners
CREATE POLICY "Authenticated users can upload tournament banners"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tournament-banners' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their uploaded banners
CREATE POLICY "Users can update tournament banners"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'tournament-banners' 
  AND auth.role() = 'authenticated'
);

-- Allow users to delete tournament banners
CREATE POLICY "Users can delete tournament banners"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tournament-banners' 
  AND auth.role() = 'authenticated'
);