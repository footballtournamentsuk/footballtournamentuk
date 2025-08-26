-- Update blog posts with cover images and alt text
UPDATE blog_posts 
SET 
  cover_image_url = '/src/assets/blog/youth-7v7-england-cover.webp',
  cover_alt = 'Youth football teams playing 7v7 match on grass pitch in England with County FA officials watching'
WHERE slug = 'host-youth-7v7-england';

UPDATE blog_posts 
SET 
  cover_image_url = '/src/assets/blog/uk-tournaments-2025-cover.webp',
  cover_alt = 'UK football tournament trophy celebration with players from England, Scotland, Wales teams'
WHERE slug = 'uk-summer-tournaments-2025';

UPDATE blog_posts 
SET 
  cover_image_url = '/src/assets/blog/county-fa-checklist-cover.webp',
  cover_alt = 'County FA registration documents and checklist paperwork with DBS certificates and player ID cards'
WHERE slug = 'county-fa-registration-checklist';

UPDATE blog_posts 
SET 
  cover_image_url = '/src/assets/blog/london-pitch-booking-cover.webp',
  cover_alt = '3G artificial grass football pitch in London with city skyline in background, modern sports facility'
WHERE slug = 'pitch-booking-london';

UPDATE blog_posts 
SET 
  cover_image_url = '/src/assets/blog/safeguarding-guidelines-cover.webp',
  cover_alt = 'UK grassroots football safeguarding training session with coaches and young players in safe environment'
WHERE slug = 'safeguarding-guidelines-uk';