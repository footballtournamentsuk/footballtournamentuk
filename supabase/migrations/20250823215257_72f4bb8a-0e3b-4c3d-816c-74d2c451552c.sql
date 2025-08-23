-- Remove all duplicate email triggers that are causing multiple emails
DROP TRIGGER IF EXISTS on_tournament_created ON public.tournaments;
DROP TRIGGER IF EXISTS tournament_created_email_trigger ON public.tournaments;
DROP TRIGGER IF EXISTS send_tournament_created_email_trigger ON public.tournaments;

-- Also remove duplicate instant alert triggers
DROP TRIGGER IF EXISTS tournaments_instant_alerts_trigger ON public.tournaments;
DROP TRIGGER IF EXISTS trigger_instant_alerts ON public.tournaments;
DROP TRIGGER IF EXISTS trigger_instant_alerts_on_tournaments ON public.tournaments;
DROP TRIGGER IF EXISTS tournament_instant_alerts_trigger ON public.tournaments;
DROP TRIGGER IF EXISTS trigger_instant_alerts_trigger ON public.tournaments;

-- Create single, clean triggers
CREATE TRIGGER send_tournament_created_email_trigger
  AFTER INSERT ON public.tournaments
  FOR EACH ROW
  EXECUTE FUNCTION public.send_tournament_created_email();

CREATE TRIGGER trigger_instant_alerts_trigger
  AFTER INSERT OR UPDATE ON public.tournaments
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_instant_alerts();