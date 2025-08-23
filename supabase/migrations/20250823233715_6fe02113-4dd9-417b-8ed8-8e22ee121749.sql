-- Fix creator email to use correct field names that match send-email function validation
CREATE OR REPLACE FUNCTION public.notify_tournament_creator()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, extensions
LANGUAGE plpgsql
AS $$
BEGIN
  -- Add a 1 second delay to prevent race conditions with instant alerts
  PERFORM pg_sleep(1);
  
  -- Send creator confirmation email using send-email function with correct field structure
  PERFORM
    net.http_post(
      url := 'https://yknmcddrfkggphrktivd.supabase.co/functions/v1/send-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlrbm1jZGRyZmtnZ3Bocmt0aXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjgzMTUsImV4cCI6MjA3MDc0NDMxNX0.y87-teQtXq7-LJiwFUvpEspiYVgDi30jSl0WVRfzXSU'
      ),
      body := jsonb_build_object(
        'type', 'tournament_created',
        'to', NEW.contact_email,
        'data', jsonb_build_object(
          'userName', NEW.contact_name,
          'tournamentName', NEW.name,
          'tournamentUrl', 'https://footballtournamentsuk.co.uk/tournaments/' || COALESCE(NEW.slug, NEW.id::text),
          'dateRange', 
            CASE 
              WHEN NEW.start_date::date = NEW.end_date::date THEN
                to_char(NEW.start_date, 'DD/MM/YYYY')
              ELSE
                to_char(NEW.start_date, 'DD/MM/YYYY') || ' - ' || to_char(NEW.end_date, 'DD/MM/YYYY')
            END,
          'location', NEW.location_name
        ),
        'sender_type', 'creator_confirmation'
      )
    );

  -- Trigger instant alerts with a delay to prevent duplicate processing
  PERFORM pg_sleep(2);
  
  PERFORM
    net.http_post(
      url := 'https://yknmcddrfkggphrktivd.supabase.co/functions/v1/alerts-instant',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlrbm1jZGRyZmtnZ3Bocmt0aXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjgzMTUsImV4cCI6MjA3MDc0NDMxNX0.y87-teQtXq7-LJiwFUvpEspiYVgDi30jSl0WVRfzXSU'
      ),
      body := jsonb_build_object(
        'tournamentId', NEW.id,
        'action', 'created'
      )
    );

  RETURN NEW;
END;
$$;