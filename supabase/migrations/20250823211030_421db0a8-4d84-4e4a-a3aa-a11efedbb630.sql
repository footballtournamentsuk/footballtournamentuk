-- Create missing triggers for tournaments table
-- Trigger for tournament creation emails
CREATE OR REPLACE TRIGGER tournament_created_email_trigger
  AFTER INSERT ON public.tournaments
  FOR EACH ROW
  EXECUTE FUNCTION public.send_tournament_created_email();

-- Trigger for instant alerts
CREATE OR REPLACE TRIGGER tournament_instant_alerts_trigger
  AFTER INSERT OR UPDATE ON public.tournaments
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_instant_alerts();