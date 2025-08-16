-- First, drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create working RLS policies for testimonials that allow admin access
-- We'll check the current user's email directly in the policy
CREATE POLICY "Allow admins and public to view testimonials"
ON public.testimonials
FOR SELECT
USING (
  published = true 
  OR 
  (
    auth.uid() IS NOT NULL AND 
    (
      auth.email() LIKE '%admin%' OR
      auth.email() LIKE '%owner%'
    )
  )
);

-- Create working RLS policies for profiles that allow admin access
CREATE POLICY "Allow users to view own profile and admins to view all"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id
  OR
  (
    auth.uid() IS NOT NULL AND 
    (
      auth.email() LIKE '%admin%' OR
      auth.email() LIKE '%owner%'
    )
  )
);