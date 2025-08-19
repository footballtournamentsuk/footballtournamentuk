-- Create analytics events table for PWA tracking
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  properties JSONB NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics events
CREATE POLICY "Anyone can insert analytics events" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all analytics events" 
ON public.analytics_events 
FOR SELECT 
USING (is_admin());

-- Create indexes for performance
CREATE INDEX idx_analytics_events_name_timestamp ON public.analytics_events(event_name, timestamp DESC);
CREATE INDEX idx_analytics_events_user_timestamp ON public.analytics_events(user_id, timestamp DESC);
CREATE INDEX idx_analytics_events_session ON public.analytics_events(session_id, timestamp DESC);

-- Create function to get PWA metrics
CREATE OR REPLACE FUNCTION public.get_pwa_metrics(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT (now() - interval '30 days'),
  end_date TIMESTAMP WITH TIME ZONE DEFAULT now()
) RETURNS TABLE(
  prompts_shown INTEGER,
  installs_completed INTEGER,
  conversion_rate NUMERIC,
  retention_7d NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prompts_count INTEGER;
  installs_count INTEGER;
  retention_count INTEGER;
  total_installs INTEGER;
BEGIN
  -- Get prompts shown
  SELECT COUNT(*)::INTEGER INTO prompts_count
  FROM analytics_events 
  WHERE event_name = 'pwa_prompt_shown' 
    AND timestamp BETWEEN start_date AND end_date;

  -- Get installs completed  
  SELECT COUNT(*)::INTEGER INTO installs_count
  FROM analytics_events 
  WHERE event_name = 'pwa_installed' 
    AND timestamp BETWEEN start_date AND end_date;

  -- Get 7-day retention (users who had activity 7 days after install)
  WITH installs AS (
    SELECT user_id, timestamp as install_date
    FROM analytics_events 
    WHERE event_name = 'pwa_installed' 
      AND timestamp BETWEEN (start_date - interval '7 days') AND (end_date - interval '7 days')
      AND user_id IS NOT NULL
  ),
  retention AS (
    SELECT DISTINCT i.user_id
    FROM installs i
    JOIN analytics_events ae ON ae.user_id = i.user_id
    WHERE ae.timestamp BETWEEN (i.install_date + interval '6 days') AND (i.install_date + interval '8 days')
  )
  SELECT COUNT(DISTINCT i.user_id)::INTEGER, COUNT(DISTINCT r.user_id)::INTEGER 
  INTO total_installs, retention_count
  FROM installs i
  LEFT JOIN retention r ON r.user_id = i.user_id;

  RETURN QUERY SELECT 
    prompts_count,
    installs_count,
    CASE WHEN prompts_count > 0 THEN ROUND((installs_count::NUMERIC / prompts_count::NUMERIC) * 100, 1) ELSE 0 END,
    CASE WHEN total_installs > 0 THEN ROUND((retention_count::NUMERIC / total_installs::NUMERIC) * 100, 1) ELSE 0 END;
END;
$$;