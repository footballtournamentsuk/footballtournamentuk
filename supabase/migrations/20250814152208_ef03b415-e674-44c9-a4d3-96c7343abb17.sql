-- Create a function to compute tournament status automatically
CREATE OR REPLACE FUNCTION public.compute_tournament_status(
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  registration_deadline timestamp with time zone
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO ''
AS $$
DECLARE
  now_ts timestamp with time zone := '2024-01-01 00:00:00+00'::timestamp with time zone; -- placeholder for now()
  start_of_today timestamp with time zone;
  start_of_tomorrow timestamp with time zone;
  end_of_today timestamp with time zone;
BEGIN
  -- This function will be called from triggers with current timestamp
  -- We'll pass the current time as a parameter in the trigger
  start_of_today := date_trunc('day', now_ts);
  start_of_tomorrow := start_of_today + interval '1 day';
  end_of_today := start_of_today + interval '1 day' - interval '1 second';
  
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

-- Add a computed_status column to store the computed status
ALTER TABLE public.tournaments 
ADD COLUMN computed_status text;

-- Create a function to update tournament status based on current time
CREATE OR REPLACE FUNCTION public.update_tournament_status()
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
  tournament_record record;
  computed_status_value text;
BEGIN
  -- Update all tournament statuses
  FOR tournament_record IN 
    SELECT id, start_date, end_date, registration_deadline 
    FROM public.tournaments
  LOOP
    -- Compute status for this tournament
    IF now_ts >= tournament_record.start_date AND now_ts <= tournament_record.end_date THEN
      computed_status_value := 'ongoing';
    ELSIF tournament_record.start_date >= start_of_today AND tournament_record.start_date <= end_of_today THEN
      computed_status_value := 'today';
    ELSIF tournament_record.start_date >= start_of_tomorrow AND tournament_record.start_date < start_of_tomorrow + interval '1 day' THEN
      computed_status_value := 'tomorrow';
    ELSIF now_ts > tournament_record.end_date THEN
      computed_status_value := 'completed';
    ELSIF tournament_record.registration_deadline IS NOT NULL THEN
      IF now_ts > tournament_record.registration_deadline THEN
        computed_status_value := 'registration_closed';
      ELSIF tournament_record.registration_deadline <= (now_ts + interval '7 days') THEN
        computed_status_value := 'registration_closes_soon';
      ELSE
        computed_status_value := 'registration_open';
      END IF;
    ELSE
      computed_status_value := 'upcoming';
    END IF;
    
    -- Update the tournament with computed status
    UPDATE public.tournaments 
    SET computed_status = computed_status_value
    WHERE id = tournament_record.id;
  END LOOP;
  
  RETURN 'Updated all tournament statuses';
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tournaments_computed_status ON public.tournaments(computed_status);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_date ON public.tournaments(start_date);

-- Initialize computed_status for existing tournaments
SELECT public.update_tournament_status();