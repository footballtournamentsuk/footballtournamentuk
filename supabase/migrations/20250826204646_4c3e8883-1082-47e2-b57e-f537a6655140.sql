-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.calculate_reading_time(content_text text)
 RETURNS integer
 LANGUAGE plpgsql
 IMMUTABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  word_count INTEGER;
BEGIN
  -- Count words by splitting on whitespace
  word_count := array_length(string_to_array(trim(content_text), ' '), 1);
  
  -- Return reading time in minutes (200 words per minute, rounded up)
  RETURN GREATEST(1, CEIL(word_count::NUMERIC / 200));
END;
$function$;