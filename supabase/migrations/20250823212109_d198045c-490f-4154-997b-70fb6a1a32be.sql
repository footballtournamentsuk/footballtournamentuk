-- Fix the database functions to use proper authorization and fix send-email payload

-- Update send_tournament_created_email function to use service role key
CREATE OR REPLACE FUNCTION public.send_tournament_created_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  organizer_email TEXT;
  organizer_name TEXT;
  tournament_url TEXT;
  date_range TEXT;
BEGIN
  -- Get organizer details from profiles
  SELECT p.contact_email, p.full_name 
  INTO organizer_email, organizer_name
  FROM public.profiles p 
  WHERE p.user_id = NEW.organizer_id;
  
  -- Build tournament URL
  tournament_url := 'https://footballtournamentsuk.co.uk/tournaments/' || COALESCE(NEW.slug, NEW.id::text);
  
  -- Format date range
  date_range := CASE 
    WHEN NEW.start_date::date = NEW.end_date::date THEN
      to_char(NEW.start_date, 'DD Mon YYYY')
    ELSE
      to_char(NEW.start_date, 'DD') || '–' || to_char(NEW.end_date, 'DD Mon YYYY')
  END;
  
  -- Send tournament created email via edge function with service role key
  PERFORM net.http_post(
    url := 'https://yknmcddrfkggphrktivd.supabase.co/functions/v1/send-email',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlrbm1jZGRyZmtnZ3Bocmt0aXZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE2ODMxNSwiZXhwIjoyMDcwNzQ0MzE1fQ.ELLaJpQOdQ1_8aagR-qLCtgPJSDnF6_LbMrW2rGFO_w"}'::jsonb,
    body := json_build_object(
      'type', 'tournament_created',
      'to', COALESCE(organizer_email, NEW.contact_email),
      'data', json_build_object(
        'userName', COALESCE(organizer_name, NEW.contact_name),
        'tournamentName', NEW.name,
        'tournamentUrl', tournament_url,
        'dateRange', date_range,
        'location', NEW.location_name
      )
    )::jsonb
  );
  
  RETURN NEW;
END;
$$;