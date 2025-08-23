-- Create the missing trigger on the tournaments table
CREATE TRIGGER trigger_instant_alerts_on_tournaments
    AFTER INSERT OR UPDATE ON public.tournaments
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_instant_alerts();