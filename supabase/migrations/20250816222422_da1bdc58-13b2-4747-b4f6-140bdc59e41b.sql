-- Create a security definer function to check if current user is admin
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop existing policies and recreate with the function
DROP POLICY IF EXISTS "Allow admins and public to view testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Allow users to view own profile and admins to view all" ON public.profiles;

-- Create testimonials policy using the function
CREATE POLICY "Public and admin testimonials access"
ON public.testimonials
FOR SELECT
USING (
  published = true 
  OR 
  (auth.uid() IS NOT NULL AND public.is_admin())
);

-- Create profiles policy using the function  
CREATE POLICY "User own profile and admin all profiles access"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id
  OR
  (auth.uid() IS NOT NULL AND public.is_admin())
);