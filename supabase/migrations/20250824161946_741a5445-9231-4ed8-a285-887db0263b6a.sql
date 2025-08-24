-- Add share cover columns to tournaments table
ALTER TABLE tournaments 
  ADD COLUMN share_cover_url text,
  ADD COLUMN share_cover_alt text,
  ADD COLUMN share_cover_variant text CHECK (share_cover_variant IN ('FB_1200x630','IG_1080x1350','IG_1080x1080')) DEFAULT 'FB_1200x630';

-- Create storage bucket for share covers
INSERT INTO storage.buckets (id, name, public) VALUES ('share-covers', 'share-covers', true);

-- Create RLS policies for share covers bucket
CREATE POLICY "Share covers are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'share-covers');

CREATE POLICY "Organizers can upload their tournament share covers" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'share-covers' AND 
  auth.uid()::text = (storage.foldername(name))[1] AND
  EXISTS (
    SELECT 1 FROM tournaments 
    WHERE id::text = (storage.foldername(name))[2] 
    AND organizer_id = auth.uid()
  )
);

CREATE POLICY "Organizers can update their tournament share covers" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'share-covers' AND 
  auth.uid()::text = (storage.foldername(name))[1] AND
  EXISTS (
    SELECT 1 FROM tournaments 
    WHERE id::text = (storage.foldername(name))[2] 
    AND organizer_id = auth.uid()
  )
);

CREATE POLICY "Organizers can delete their tournament share covers" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'share-covers' AND 
  auth.uid()::text = (storage.foldername(name))[1] AND
  EXISTS (
    SELECT 1 FROM tournaments 
    WHERE id::text = (storage.foldername(name))[2] 
    AND organizer_id = auth.uid()
  )
);

-- Optional: Backfill existing tournaments with banner_url as share_cover_url
UPDATE tournaments 
SET share_cover_url = banner_url 
WHERE share_cover_url IS NULL AND banner_url IS NOT NULL;