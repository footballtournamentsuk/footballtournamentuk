-- Update Spring Tournament article cover image to use real stock photo
UPDATE blog_posts 
SET 
  cover_image_url = '/images/blog/spring-tournament-season-2026-cover.jpg',
  cover_alt = 'Football pitch with spring grass and field markings'
WHERE slug = 'spring-tournament-season-2026-what-teams-need-to-know';