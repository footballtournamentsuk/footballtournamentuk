-- First, let's remove the problematic triggers that try to use net.http_post
DROP TRIGGER IF EXISTS send_tournament_created_email_trigger ON public.tournaments;
DROP TRIGGER IF EXISTS trigger_instant_alerts_trigger ON public.tournaments;

-- Let's also remove the trigger functions that use net.http_post since they won't work
DROP FUNCTION IF EXISTS public.send_tournament_created_email();
DROP FUNCTION IF EXISTS public.trigger_instant_alerts();

-- Create a simplified notification function that just logs (for debugging)
CREATE OR REPLACE FUNCTION public.notify_tournament_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Insert a record that can be monitored for webhook purposes
    INSERT INTO analytics_events (
        event_name, 
        properties, 
        session_id,
        user_id,
        timestamp
    ) VALUES (
        'tournament_created_webhook',
        json_build_object(
            'tournament_id', NEW.id,
            'tournament_name', NEW.name,
            'action', 'created'
        ),
        'system',
        NEW.organizer_id,
        now()
    );
    
    RETURN NEW;
END;
$$;

-- Create trigger for tournament creation
CREATE TRIGGER tournament_created_webhook_trigger
    AFTER INSERT ON public.tournaments
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_tournament_created();