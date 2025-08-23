-- Enable realtime for tournaments table
ALTER TABLE public.tournaments REPLICA IDENTITY FULL;

-- Add tournaments table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournaments;