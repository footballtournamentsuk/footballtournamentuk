-- Update testimonials policies to use is_admin() function consistently
DROP POLICY IF EXISTS "Admins can update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can delete testimonials" ON public.testimonials;

-- Create new policies using the is_admin() function
CREATE POLICY "Admins can update testimonials" 
ON public.testimonials 
FOR UPDATE 
USING ((auth.uid() IS NOT NULL) AND is_admin());

CREATE POLICY "Admins can delete testimonials" 
ON public.testimonials 
FOR DELETE 
USING ((auth.uid() IS NOT NULL) AND is_admin());