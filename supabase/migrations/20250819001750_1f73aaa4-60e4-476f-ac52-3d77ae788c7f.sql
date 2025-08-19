-- Fix the handle_new_user trigger to only create profile, not send welcome email
-- Welcome email should be sent after email verification

-- First, let's update the trigger to only create the profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Only insert profile record, don't send welcome email yet
  INSERT INTO public.profiles (user_id, contact_email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  
  RETURN NEW;
END;
$function$;

-- Create a new function to send welcome email after email confirmation
CREATE OR REPLACE FUNCTION public.handle_email_confirmed()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Only send welcome email when email is confirmed (email_confirmed_at changes from null to a timestamp)
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    -- Send welcome email via edge function
    PERFORM net.http_post(
      url := 'https://yknmcddrfkggphrktivd.supabase.co/functions/v1/send-email',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlrbm1jZGRyZmtnZ3Bocmt0aXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjgzMTUsImV4cCI6MjA3MDc0NDMxNX0.y87-teQtXq7-LJiwFUvpEspiYVgDi30jSl0WVRfzXSU"}'::jsonb,
      body := json_build_object(
        'type', 'welcome',
        'to', NEW.email,
        'data', json_build_object(
          'userName', COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'there')
        )
      )::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Drop existing trigger if it exists and create new one for email confirmation
DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;
CREATE TRIGGER on_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_email_confirmed();