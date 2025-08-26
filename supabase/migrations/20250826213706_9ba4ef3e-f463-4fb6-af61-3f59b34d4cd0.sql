-- Fix the blog_tags RLS policy to avoid accessing auth.users table directly

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins and owners can manage tags" ON public.blog_tags;

-- Create a new policy that only checks the profiles table for admin role
CREATE POLICY "Admins and owners can manage tags" ON public.blog_tags
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    -- Check if user is admin by checking profiles table
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
  )
);