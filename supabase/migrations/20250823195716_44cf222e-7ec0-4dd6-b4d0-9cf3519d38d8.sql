-- Fix function search path security issue
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
    -- Call the instant alerts function asynchronously
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