-- Fix duplicate emails and 401 authorization issues

-- First, drop any existing triggers to avoid duplicates
DROP TRIGGER IF EXISTS send_tournament_created_email_trigger ON public.tournaments;
DROP TRIGGER IF EXISTS trigger_instant_alerts_trigger ON public.tournaments;

-- Update trigger_instant_alerts function to use proper service role authorization
CREATE OR REPLACE FUNCTION public.trigger_instant_alerts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Only trigger for new tournaments or significant updates
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (
    OLD.name != NEW.name OR
    OLD.location_name != NEW.location_name OR
    OLD.start_date != NEW.start_date OR
    OLD.end_date != NEW.end_date OR
    OLD.format != NEW.format OR
    OLD.age_groups != NEW.age_groups OR
    OLD.team_types != NEW.team_types OR
    OLD.type != NEW.type OR
    OLD.cost_amount != NEW.cost_amount OR
    OLD.registration_deadline != NEW.registration_deadline
  )) THEN
    -- Call the instant alerts function with proper service role authorization
    PERFORM net.http_post(
      url := 'https://yknmcddrfkggphrktivd.supabase.co/functions/v1/alerts-instant',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlrbm1jZGRyZmtnZ3Bocmt0aXZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE2ODMxNSwiZXhwIjoyMDcwNzQ0MzE1fQ.ELLaJpQOdQ1_8aagR-qLCtgPJSDnF6_LbMrW2rGFO_w"}'::jsonb,
      body := json_build_object(
        'tournamentId', NEW.id,
        'action', CASE WHEN TG_OP = 'INSERT' THEN 'created' ELSE 'updated' END
      )::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create single trigger for tournament creation emails (AFTER INSERT only to avoid duplicates)
CREATE TRIGGER send_tournament_created_email_trigger
  AFTER INSERT ON public.tournaments
  FOR EACH ROW
  EXECUTE FUNCTION public.send_tournament_created_email();

-- Create single trigger for instant alerts (AFTER INSERT/UPDATE to avoid duplicates)
CREATE TRIGGER trigger_instant_alerts_trigger
  AFTER INSERT OR UPDATE ON public.tournaments
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_instant_alerts();