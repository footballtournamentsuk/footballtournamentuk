-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  cover_image_url TEXT,
  cover_alt TEXT,
  author_id UUID REFERENCES public.profiles(user_id),
  tags TEXT[] DEFAULT '{}',
  published_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'draft',
  reading_time INTEGER,
  og_image_url TEXT,
  canonical_url TEXT,
  likes_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create blog_post_likes table
CREATE TABLE public.blog_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  session_id TEXT,
  user_id UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (post_id, session_id),
  UNIQUE (post_id, user_id)
);

-- Create indexes
CREATE INDEX idx_blog_posts_status_published ON public.blog_posts (status, published_at DESC);
CREATE INDEX idx_blog_posts_tags ON public.blog_posts USING GIN (tags);
CREATE INDEX idx_blog_post_likes_post_id ON public.blog_post_likes (post_id);
CREATE INDEX idx_blog_post_likes_session ON public.blog_post_likes (session_id);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for blog_posts
CREATE POLICY "Published posts viewable by everyone" 
ON public.blog_posts 
FOR SELECT 
USING (status = 'published' AND published_at <= now());

CREATE POLICY "Authors can view their own posts" 
ON public.blog_posts 
FOR SELECT 
USING (auth.uid() = author_id);

CREATE POLICY "Admins can view all posts" 
ON public.blog_posts 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Authors can create posts" 
ON public.blog_posts 
FOR INSERT 
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own posts" 
ON public.blog_posts 
FOR UPDATE 
USING (auth.uid() = author_id);

CREATE POLICY "Admins can update all posts" 
ON public.blog_posts 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Authors can delete their own posts" 
ON public.blog_posts 
FOR DELETE 
USING (auth.uid() = author_id);

CREATE POLICY "Admins can delete all posts" 
ON public.blog_posts 
FOR DELETE 
USING (is_admin());

-- RLS policies for blog_post_likes
CREATE POLICY "Anyone can view likes" 
ON public.blog_post_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create likes" 
ON public.blog_post_likes 
FOR INSERT 
WITH CHECK (
  (session_id IS NOT NULL AND user_id IS NULL) OR 
  (user_id IS NOT NULL AND auth.uid() = user_id)
);

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_blog_slug(post_title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase, replace spaces and special chars with hyphens
  base_slug := lower(regexp_replace(post_title, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Ensure slug is not empty
  IF base_slug = '' THEN
    base_slug := 'post';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Function to calculate reading time
CREATE OR REPLACE FUNCTION public.calculate_reading_time(content_text TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  word_count INTEGER;
BEGIN
  -- Count words by splitting on whitespace
  word_count := array_length(string_to_array(trim(content_text), ' '), 1);
  
  -- Return reading time in minutes (200 words per minute, rounded up)
  RETURN GREATEST(1, CEIL(word_count::NUMERIC / 200));
END;
$$;

-- Trigger to auto-generate slug and reading time
CREATE OR REPLACE FUNCTION public.handle_blog_post_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Generate slug if not provided or if title changed and not published
  IF NEW.slug IS NULL OR (NEW.slug = OLD.slug AND NEW.title != OLD.title AND OLD.status != 'published') THEN
    NEW.slug := public.generate_blog_slug(NEW.title);
  END IF;
  
  -- Calculate reading time from content
  IF NEW.content IS NOT NULL THEN
    NEW.reading_time := public.calculate_reading_time(NEW.content);
  END IF;
  
  -- Update timestamp
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER blog_post_changes_trigger
  BEFORE INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_blog_post_changes();

-- Trigger to update likes count
CREATE OR REPLACE FUNCTION public.update_blog_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.blog_posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.blog_posts 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER blog_likes_count_trigger
  AFTER INSERT OR DELETE ON public.blog_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_blog_likes_count();