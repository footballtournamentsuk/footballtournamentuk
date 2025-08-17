-- Update handle_new_user function to send welcome email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Insert profile record
  INSERT INTO public.profiles (user_id, contact_email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  
  -- Send welcome email via edge function
  PERFORM net.http_post(
    url := 'https://yknmcddrfkggphrktivd.supabase.co/functions/v1/send-email',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlrbm1jZGRyZmtnZ3Bocmt0aXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjgzMTUsImV4cCI6MjA3MDc0NDMxNX0.y87-teQtXq7-LJiwFUvpEspiYVgDi30jSl0WVRfzXSU"}'::jsonb,
    body := json_build_object(
      'type', 'welcome',
      'to', NEW.email,
      'data', json_build_object(
        'userName', COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'there')
      )
    )::jsonb
  );
  
  RETURN NEW;
END;
$$;

-- Function to send tournament created email
CREATE OR REPLACE FUNCTION public.send_tournament_created_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
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
  
  -- Send tournament created email via edge function
  PERFORM net.http_post(
    url := 'https://yknmcddrfkggphrktivd.supabase.co/functions/v1/send-email',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlrbm1jZGRyZmtnZ3Bocmt0aXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjgzMTUsImV4cCI6MjA3MDc0NDMxNX0.y87-teQtXq7-LJiwFUvpEspiYVgDi30jSl0WVRfzXSU"}'::jsonb,
    body := json_build_object(
      'type', 'tournament_created',
      'to', organizer_email,
      'data', json_build_object(
        'userName', COALESCE(organizer_name, 'Organizer'),
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

-- Create trigger for tournament created emails
CREATE TRIGGER on_tournament_created
  AFTER INSERT ON public.tournaments
  FOR EACH ROW EXECUTE FUNCTION public.send_tournament_created_email();

-- Function to send review request emails (can be called manually or via cron)
CREATE OR REPLACE FUNCTION public.send_review_request_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  tournament_record RECORD;
  organizer_email TEXT;
  organizer_name TEXT;
  tournament_url TEXT;
BEGIN
  -- Find tournaments that ended 2 days ago and haven't had review emails sent yet
  FOR tournament_record IN
    SELECT id, name, slug, organizer_id, end_date, location_name
    FROM public.tournaments
    WHERE end_date::date = (CURRENT_DATE - interval '2 days')::date
      AND NOT EXISTS (
        SELECT 1 FROM public.tournament_review_emails_sent 
        WHERE tournament_id = tournaments.id
      )
  LOOP
    -- Get organizer details
    SELECT p.contact_email, p.full_name 
    INTO organizer_email, organizer_name
    FROM public.profiles p 
    WHERE p.user_id = tournament_record.organizer_id;
    
    -- Build tournament URL
    tournament_url := 'https://footballtournamentsuk.co.uk/tournaments/' || 
                     COALESCE(tournament_record.slug, tournament_record.id::text);
    
    -- Send review request email
    PERFORM net.http_post(
      url := 'https://yknmcddrfkggphrktivd.supabase.co/functions/v1/send-email',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlrbm1jZGRyZmtnZ3Bocmt0aXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjgzMTUsImV4cCI6MjA3MDc0NDMxNX0.y87-teQtXq7-LJiwFUvpEspiYVgDi30jSl0WVRfzXSU"}'::jsonb,
      body := json_build_object(
        'type', 'review_request',
        'to', organizer_email,
        'data', json_build_object(
          'userName', COALESCE(organizer_name, 'Organizer'),
          'tournamentName', tournament_record.name,
          'tournamentUrl', tournament_url
        )
      )::jsonb
    );
    
    -- Mark as sent to avoid duplicates
    INSERT INTO public.tournament_review_emails_sent (tournament_id, sent_at)
    VALUES (tournament_record.id, NOW());
  END LOOP;
END;
$$;

-- Create tracking table for review emails sent
CREATE TABLE public.tournament_review_emails_sent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(tournament_id)
);

-- Enable RLS on tracking table
ALTER TABLE public.tournament_review_emails_sent ENABLE ROW LEVEL SECURITY;

-- Create policy for tracking table (admins only)
CREATE POLICY "Admins can view review email tracking"
ON public.tournament_review_emails_sent
FOR SELECT
USING (is_admin());