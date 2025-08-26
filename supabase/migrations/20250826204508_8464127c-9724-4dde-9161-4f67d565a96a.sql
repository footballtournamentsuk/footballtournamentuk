-- Add sources field to blog_posts table
ALTER TABLE blog_posts 
ADD COLUMN sources JSONB DEFAULT '[]'::jsonb;

-- Update reading times for existing posts using the calculate_reading_time function
UPDATE blog_posts 
SET reading_time = calculate_reading_time(content)
WHERE content IS NOT NULL;

-- Add some example sources to demonstrate the feature
UPDATE blog_posts 
SET sources = '[
  {"label": "The FA Official Guidelines", "url": "https://www.thefa.com/football-rules-governance/safeguarding"},
  {"label": "County FA Registration Process", "url": "https://www.thefa.com/about-football-association/what-we-do/county-fas"}
]'::jsonb
WHERE slug = 'county-fa-registration-checklist';

UPDATE blog_posts 
SET sources = '[
  {"label": "FA Youth Development Review 2024", "url": "https://www.thefa.com/news/2024/youth-development-review"}
]'::jsonb
WHERE slug = 'host-youth-7v7-england';