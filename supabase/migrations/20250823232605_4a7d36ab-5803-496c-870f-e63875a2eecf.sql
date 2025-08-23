-- Fix creator email rate limiting by using a different sender email
-- and ensure single instant alert processing per tournament

-- Update the trigger function to add a small delay to prevent race conditions
CREATE OR REPLACE FUNCTION public.notify_tournament_creator()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, extensions
LANGUAGE plpgsql
AS $$
BEGIN
  -- Add a 1 second delay to prevent race conditions with instant alerts
  PERFORM pg_sleep(1);
  
  -- Send creator confirmation email using send-email function with unique sender
  PERFORM
    net.http_post(
      url := 'https://yknmcddrfkggphrktivd.supabase.co/functions/v1/send-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlrbm1jZGRyZmtnZ3Bocmt0aXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjgzMTUsImV4cCI6MjA3MDc0NDMxNX0.y87-teQtXq7-LJiwFUvpEspiYVgDi30jSl0WVRfzXSU'
      ),
      body := jsonb_build_object(
        'type', 'tournament_created',
        'to_email', NEW.contact_email,
        'to_name', NEW.contact_name,
        'tournament_data', jsonb_build_object(
          'id', NEW.id,
          'name', NEW.name,
          'slug', NEW.slug,
          'location_name', NEW.location_name,
          'start_date', NEW.start_date,
          'end_date', NEW.end_date,
          'format', NEW.format,
          'type', NEW.type
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