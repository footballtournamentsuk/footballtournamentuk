-- Add trigger to automatically send confirmation email to tournament creator
CREATE OR REPLACE FUNCTION notify_tournament_creator()
RETURNS TRIGGER AS $$
BEGIN
  -- Send confirmation email to tournament creator
  PERFORM net.http_post(
    url := 'https://yknmcddrfkggphrktivd.supabase.co/functions/v1/send-email',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlrbm1jZGRyZmtnZ3Bocmt0aXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjgzMTUsImV4cCI6MjA3MDc0NDMxNX0.y87-teQtXq7-LJiwFUvpEspiYVgDi30jSl0WVRfzXSU"}'::jsonb,
    body := json_build_object(
      'type', 'tournament_created',
      'to', NEW.contact_email,
      'data', json_build_object(
        'userName', NEW.contact_name,
        'tournamentName', NEW.name,
        'tournamentUrl', 'https://footballtournamentsuk.co.uk/tournaments/' || COALESCE(NEW.slug, NEW.id::text),
        'dateRange', to_char(NEW.start_date, 'DD/MM/YYYY') || 
                    CASE WHEN NEW.end_date != NEW.start_date 
                         THEN ' - ' || to_char(NEW.end_date, 'DD/MM/YYYY')
                         ELSE '' END,
        'location', NEW.location_name
      )
    )::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for tournament creation
DROP TRIGGER IF EXISTS tournament_creator_notification ON tournaments;
CREATE TRIGGER tournament_creator_notification
  AFTER INSERT ON tournaments
  FOR EACH ROW
  EXECUTE FUNCTION notify_tournament_creator();