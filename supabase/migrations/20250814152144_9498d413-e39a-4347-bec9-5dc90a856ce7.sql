-- Create a function to compute tournament status automatically
CREATE OR REPLACE FUNCTION public.compute_tournament_status(
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  registration_deadline timestamp with time zone
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  now_ts timestamp with time zone := now();
  start_of_today timestamp with time zone := date_trunc('day', now_ts);
  start_of_tomorrow timestamp with time zone := start_of_today + interval '1 day';
  end_of_today timestamp with time zone := start_of_today + interval '1 day' - interval '1 second';
BEGIN
  -- If tournament is currently happening
  IF now_ts >= start_date AND now_ts <= end_date THEN
    RETURN 'ongoing';
  END IF;
  
  -- If tournament starts today
  IF start_date >= start_of_today AND start_date <= end_of_today THEN
    RETURN 'today';
  END IF;
  
  -- If tournament starts tomorrow
  IF start_date >= start_of_tomorrow AND start_date < start_of_tomorrow + interval '1 day' THEN
    RETURN 'tomorrow';
  END IF;
  
  -- If tournament has ended
  IF now_ts > end_date THEN
    RETURN 'completed';
  END IF;
  
  -- For upcoming tournaments, check registration status
  IF registration_deadline IS NOT NULL THEN
    -- If registration deadline has passed
    IF now_ts > registration_deadline THEN
      RETURN 'registration_closed';
    END IF;
    
    -- If registration closes within 7 days
    IF registration_deadline <= (now_ts + interval '7 days') THEN
      RETURN 'registration_closes_soon';
    END IF;
    
    -- Registration is open
    RETURN 'registration_open';
  END IF;
  
  -- Default for upcoming tournaments without registration deadline
  RETURN 'upcoming';
END;
$$;

-- Add a computed column for status
ALTER TABLE public.tournaments 
ADD COLUMN computed_status text GENERATED ALWAYS AS (
  public.compute_tournament_status(start_date, end_date, registration_deadline)
) STORED;

-- Create an index on the computed status for better query performance
CREATE INDEX idx_tournaments_computed_status ON public.tournaments(computed_status);

-- Create an index on start_date for sorting
CREATE INDEX idx_tournaments_start_date ON public.tournaments(start_date);