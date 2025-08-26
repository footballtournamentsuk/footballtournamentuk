-- Update RLS policies for owner-only blog management

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Authors can create posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors can update their own posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authors can delete their own posts" ON public.blog_posts;

-- Create owner-only policies for blog_posts
CREATE POLICY "Only owner can create posts" ON public.blog_posts
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%owner%'
);

CREATE POLICY "Only owner can update posts" ON public.blog_posts
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND 
  (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%owner%'
);

CREATE POLICY "Only owner can delete posts" ON public.blog_posts
FOR DELETE USING (
  auth.uid() IS NOT NULL AND 
  (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%owner%'
);

-- Create tags table for blog management
CREATE TABLE IF NOT EXISTS public.blog_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  color text DEFAULT '#6366F1',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on blog_tags
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_tags
CREATE POLICY "Anyone can view tags" ON public.blog_tags
FOR SELECT USING (true);

CREATE POLICY "Only owner can manage tags" ON public.blog_tags
FOR ALL USING (
  auth.uid() IS NOT NULL AND 
  (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%owner%'
);

-- Insert UK taxonomy seed tags
INSERT INTO public.blog_tags (name, slug, color) VALUES
  ('UK', 'uk', '#1D4ED8'),
  ('England', 'england', '#DC2626'),
  ('Scotland', 'scotland', '#7C3AED'),
  ('Wales', 'wales', '#059669'),
  ('Northern Ireland', 'northern-ireland', '#EA580C'),
  ('London', 'london', '#BE123C'),
  ('Manchester', 'manchester', '#7C2D12'),
  ('Birmingham', 'birmingham', '#0891B2'),
  ('Liverpool', 'liverpool', '#C2410C'),
  ('Youth Football', 'youth-football', '#15803D'),
  ('Grassroots', 'grassroots', '#16A34A'),
  ('Tournament', 'tournament', '#0D9488'),
  ('Registration', 'registration', '#8B5CF6'),
  ('Safeguarding', 'safeguarding', '#DB2777'),
  ('County FA', 'county-fa', '#2563EB')
ON CONFLICT (slug) DO NOTHING;

-- Add trigger for blog_tags updated_at
CREATE TRIGGER update_blog_tags_updated_at
  BEFORE UPDATE ON public.blog_tags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();