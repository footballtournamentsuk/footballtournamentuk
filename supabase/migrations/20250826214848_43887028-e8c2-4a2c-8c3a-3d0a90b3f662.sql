-- Fix blog_posts RLS policies to avoid accessing auth.users table directly

-- Drop the problematic policies that access auth.users
DROP POLICY IF EXISTS "Admins and owners can create posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins and owners can delete posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins and owners can update posts" ON public.blog_posts;

-- Create new policies that only check the profiles table
CREATE POLICY "Admins and owners can create posts" ON public.blog_posts
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
  )
);

CREATE POLICY "Admins and owners can delete posts" ON public.blog_posts
FOR DELETE USING (
  auth.uid() IS NOT NULL AND (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
  )
);

CREATE POLICY "Admins and owners can update posts" ON public.blog_posts
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
  )
);