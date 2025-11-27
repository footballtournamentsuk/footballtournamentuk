-- Create function to clean up tournament images from storage
CREATE OR REPLACE FUNCTION public.cleanup_tournament_images()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, storage
LANGUAGE plpgsql
AS $$
DECLARE
  banner_path TEXT;
  gallery_path TEXT;
BEGIN
  -- Extract file path from banner_url if exists
  IF OLD.banner_url IS NOT NULL THEN
    -- Extract path after '/storage/v1/object/public/banners/'
    banner_path := regexp_replace(OLD.banner_url, '^.*/banners/', '');
    
    IF banner_path IS NOT NULL AND banner_path != '' THEN
      -- Delete banner image from storage
      DELETE FROM storage.objects 
      WHERE bucket_id = 'banners' AND name = banner_path;
      
      RAISE LOG 'Deleted banner image: %', banner_path;
    END IF;
  END IF;
  
  -- Delete gallery images if exists
  IF OLD.gallery_images IS NOT NULL AND array_length(OLD.gallery_images, 1) > 0 THEN
    FOREACH gallery_path IN ARRAY OLD.gallery_images
    LOOP
      -- Extract path from gallery image URL
      gallery_path := regexp_replace(gallery_path, '^.*/banners/', '');
      
      IF gallery_path IS NOT NULL AND gallery_path != '' THEN
        DELETE FROM storage.objects 
        WHERE bucket_id = 'banners' AND name = gallery_path;
        
        RAISE LOG 'Deleted gallery image: %', gallery_path;
      END IF;
    END LOOP;
  END IF;
  
  RETURN OLD;
END;
$$;

-- Create trigger to cleanup images on tournament deletion
DROP TRIGGER IF EXISTS cleanup_tournament_images_trigger ON public.tournaments;

CREATE TRIGGER cleanup_tournament_images_trigger
  BEFORE DELETE ON public.tournaments
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_tournament_images();

-- Add comment for documentation
COMMENT ON FUNCTION public.cleanup_tournament_images() IS 
'Automatically deletes tournament banner and gallery images from storage when a tournament is deleted';