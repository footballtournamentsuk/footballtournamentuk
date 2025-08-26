-- Update blog posts with license-safe cover images and improved alt text
UPDATE blog_posts 
SET 
  cover_image_url = '/src/assets/blog/youth-7v7-england-cover.webp',
  cover_alt = 'Youth grassroots football players training on grass pitch in England with coaches and goal posts'
WHERE slug = 'host-youth-7v7-england';

UPDATE blog_posts 
SET 
  cover_image_url = '/src/assets/blog/uk-tournaments-2025-cover.webp',
  cover_alt = 'UK football tournament trophy ceremony with youth players celebrating achievements across England, Scotland, Wales'
WHERE slug = 'uk-summer-tournaments-2025';

UPDATE blog_posts 
SET 
  cover_image_url = '/src/assets/blog/county-fa-checklist-cover.webp',
  cover_alt = 'Football registration paperwork and checklist documents with DBS certificates and player ID cards for UK grassroots football'
WHERE slug = 'county-fa-registration-checklist';

UPDATE blog_posts 
SET 
  cover_image_url = '/src/assets/blog/london-pitch-booking-cover.webp',
  cover_alt = 'Modern 3G artificial grass football pitch in urban UK setting with city buildings in background'
WHERE slug = 'pitch-booking-london';

UPDATE blog_posts 
SET 
  cover_image_url = '/src/assets/blog/safeguarding-guidelines-cover.webp',
  cover_alt = 'UK grassroots football safeguarding training session with coaches and young players in safe environment'
WHERE slug = 'safeguarding-guidelines-uk';