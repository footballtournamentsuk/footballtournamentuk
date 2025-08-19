-- Add functions to calculate funnel and performance metrics from analytics_events

CREATE OR REPLACE FUNCTION public.get_funnel_metrics(start_date timestamp with time zone DEFAULT (now() - '30 days'::interval), end_date timestamp with time zone DEFAULT now())
RETURNS TABLE(
  list_views integer,
  detail_views integer, 
  registration_starts integer,
  registration_completions integer,
  drop_off_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  list_count INTEGER;
  detail_count INTEGER;
  reg_start_count INTEGER;
  reg_complete_count INTEGER;
BEGIN
  -- Get funnel step counts
  SELECT COUNT(*)::INTEGER INTO list_count
  FROM analytics_events 
  WHERE event_name = 'tournament_list_view' 
    AND timestamp BETWEEN start_date AND end_date;

  SELECT COUNT(*)::INTEGER INTO detail_count  
  FROM analytics_events
  WHERE event_name = 'tournament_detail_view'
    AND timestamp BETWEEN start_date AND end_date;

  SELECT COUNT(*)::INTEGER INTO reg_start_count
  FROM analytics_events
  WHERE event_name = 'registration_start' 
    AND timestamp BETWEEN start_date AND end_date;

  SELECT COUNT(*)::INTEGER INTO reg_complete_count
  FROM analytics_events
  WHERE event_name = 'registration_complete'
    AND timestamp BETWEEN start_date AND end_date;

  RETURN QUERY SELECT 
    list_count,
    detail_count,
    reg_start_count, 
    reg_complete_count,
    CASE WHEN reg_start_count > 0 THEN 
      ROUND(((reg_start_count - reg_complete_count)::NUMERIC / reg_start_count::NUMERIC) * 100, 1) 
    ELSE 0 END;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_performance_metrics(start_date timestamp with time zone DEFAULT (now() - '30 days'::interval), end_date timestamp with time zone DEFAULT now())
RETURNS TABLE(
  avg_api_latency numeric,
  error_rate numeric,
  avg_lcp numeric,
  avg_fid numeric, 
  avg_cls numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH api_metrics AS (
    SELECT 
      AVG((properties->>'duration_ms')::numeric) as avg_latency,
      (COUNT(*) FILTER (WHERE (properties->>'success')::boolean = false)::NUMERIC / COUNT(*)::NUMERIC) * 100 as error_pct
    FROM analytics_events 
    WHERE event_name = 'api_call'
      AND timestamp BETWEEN start_date AND end_date
      AND properties ? 'duration_ms'
  ),
  vitals_metrics AS (
    SELECT
      AVG((properties->>'lcp')::numeric) FILTER (WHERE properties ? 'lcp' AND (properties->>'lcp')::numeric > 0) as avg_lcp_val,
      AVG((properties->>'fid')::numeric) FILTER (WHERE properties ? 'fid' AND (properties->>'fid')::numeric > 0) as avg_fid_val,
      AVG((properties->>'cls')::numeric) FILTER (WHERE properties ? 'cls' AND (properties->>'cls')::numeric > 0) as avg_cls_val
    FROM analytics_events
    WHERE event_name = 'core_web_vitals'
      AND timestamp BETWEEN start_date AND end_date
  )
  SELECT 
    ROUND(COALESCE(api_metrics.avg_latency, 0), 0),
    ROUND(COALESCE(api_metrics.error_pct, 0), 1),
    ROUND(COALESCE(vitals_metrics.avg_lcp_val, 0), 0),
    ROUND(COALESCE(vitals_metrics.avg_fid_val, 0), 0),
    ROUND(COALESCE(vitals_metrics.avg_cls_val, 0), 3)
  FROM api_metrics, vitals_metrics;
END;
$function$;