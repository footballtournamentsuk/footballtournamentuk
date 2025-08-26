-- Promote admin@footballtournamentsuk.com to admin role
UPDATE public.profiles 
SET role = 'admin'
WHERE user_id = 'd9a52a93-9cf2-41c0-b3a0-27be62fbccdb';

-- Update RLS policies to allow both admin and owner roles

-- Drop existing owner-only policies for blog_posts
DROP POLICY IF EXISTS "Only owner can create posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Only owner can update posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Only owner can delete posts" ON public.blog_posts;

-- Create admin/owner policies for blog_posts
CREATE POLICY "Admins and owners can create posts" ON public.blog_posts
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND (
    (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%owner%' OR
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
  )
);

CREATE POLICY "Admins and owners can update posts" ON public.blog_posts
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND (
    (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%owner%' OR
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
  )
);

CREATE POLICY "Admins and owners can delete posts" ON public.blog_posts
FOR DELETE USING (
  auth.uid() IS NOT NULL AND (
    (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%owner%' OR
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
  )
);

-- Update blog_tags policies for admin/owner access
DROP POLICY IF EXISTS "Only owner can manage tags" ON public.blog_tags;

CREATE POLICY "Admins and owners can manage tags" ON public.blog_tags
FOR ALL USING (
  auth.uid() IS NOT NULL AND (
    (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%owner%' OR
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
  )
);