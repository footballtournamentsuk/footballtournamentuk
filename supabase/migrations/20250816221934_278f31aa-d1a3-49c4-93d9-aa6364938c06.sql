-- Add RLS policy for admins to view all testimonials (including unpublished ones)
CREATE POLICY "Admins can view all testimonials"
ON public.testimonials
FOR SELECT
USING (
  -- Allow published testimonials for everyone (existing policy covers this)
  published = true 
  OR 
  -- Allow all testimonials for admin users
  (
    auth.uid() IS NOT NULL AND 
    (
      (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%admin%' OR
      (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%owner%'
    )
  )
);

-- Add RLS policy for admins to view all user profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  -- Users can view their own profile (existing policy covers this)
  auth.uid() = user_id
  OR
  -- Admins can view all profiles
  (
    auth.uid() IS NOT NULL AND 
    (
      (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%admin%' OR
      (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%owner%'
    )
  )
);