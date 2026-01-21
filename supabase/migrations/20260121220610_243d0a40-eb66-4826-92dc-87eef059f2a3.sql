-- Update Easter Half-Term article cover image
UPDATE blog_posts 
SET 
  cover_image_url = '/images/blog/easter-half-term-tournaments-2026-cover.jpg',
  cover_alt = 'Football on grass pitch in sunny weather'
WHERE slug = 'easter-half-term-football-tournaments-2026';

-- Update Tournament Format Guide article cover image
UPDATE blog_posts 
SET 
  cover_image_url = '/images/blog/choosing-tournament-format-guide-cover.jpg',
  cover_alt = 'Aerial view of football pitch showing full field layout'
WHERE slug = 'how-to-choose-right-tournament-format-for-your-team';