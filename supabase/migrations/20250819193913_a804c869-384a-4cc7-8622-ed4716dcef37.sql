-- Enable real-time updates for tournaments table
ALTER TABLE public.tournaments REPLICA IDENTITY FULL;

-- Add tournaments table to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;