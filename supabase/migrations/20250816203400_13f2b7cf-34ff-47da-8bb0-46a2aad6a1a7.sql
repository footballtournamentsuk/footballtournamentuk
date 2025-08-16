-- Add slug column to tournaments table
ALTER TABLE public.tournaments 
ADD COLUMN slug TEXT UNIQUE;

-- Create index for better performance
CREATE INDEX idx_tournaments_slug ON public.tournaments(slug);

-- Create function to generate slug from tournament name
CREATE OR REPLACE FUNCTION public.generate_tournament_slug(tournament_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase, replace spaces and special chars with hyphens
  base_slug := lower(regexp_replace(tournament_name, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Ensure slug is not empty
  IF base_slug = '' THEN
    base_slug := 'tournament';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM public.tournaments WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Update existing tournaments with generated slugs
UPDATE public.tournaments 
SET slug = public.generate_tournament_slug(name)
WHERE slug IS NULL;