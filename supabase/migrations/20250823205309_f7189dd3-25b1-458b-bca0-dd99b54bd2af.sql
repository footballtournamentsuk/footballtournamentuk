-- Fix the authorization token in the trigger function for instant alerts
CREATE OR REPLACE FUNCTION public.trigger_instant_alerts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
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
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}'::jsonb,
      body := json_build_object(
        'tournamentId', NEW.id,
        'action', CASE WHEN TG_OP = 'INSERT' THEN 'created' ELSE 'updated' END
      )::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$function$;