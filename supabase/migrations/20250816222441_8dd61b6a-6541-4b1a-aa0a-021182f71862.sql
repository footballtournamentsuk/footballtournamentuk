-- Fix the security warning by setting the search path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get the current user's email from auth.users
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  -- Check if email contains admin or owner
  RETURN (user_email LIKE '%admin%' OR user_email LIKE '%owner%');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;