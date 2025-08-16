-- Add policies to allow admin users to update and delete testimonials
-- Create policies for admin users (identified by email pattern for MVP)

CREATE POLICY "Admins can update testimonials"
ON public.testimonials
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND 
  (
    (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%admin%' OR
    (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%owner%'
  )
);

CREATE POLICY "Admins can delete testimonials"
ON public.testimonials
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND 
  (
    (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%admin%' OR
    (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%owner%'
  )
);