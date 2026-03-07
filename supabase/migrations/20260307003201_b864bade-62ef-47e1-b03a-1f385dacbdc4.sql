
-- Drop the trigger that tries to directly delete from storage.objects (which is blocked by Supabase)
DROP TRIGGER IF EXISTS cleanup_tournament_images_trigger ON public.tournaments;
DROP FUNCTION IF EXISTS public.cleanup_tournament_images();
