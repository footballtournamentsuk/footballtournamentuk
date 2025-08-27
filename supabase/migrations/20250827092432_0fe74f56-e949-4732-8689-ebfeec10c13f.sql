-- Update blog post cover image URLs to use public folder paths
UPDATE blog_posts 
SET cover_image_url = '/images/blog/youth-7v7-england-cover.webp'
WHERE id = '5e8781bf-d97a-43e4-8338-e16e440cb682';

UPDATE blog_posts 
SET cover_image_url = '/images/blog/london-pitch-booking-cover.webp'
WHERE id = '93145996-85dd-41fe-b692-3a068189ed4c';

UPDATE blog_posts 
SET cover_image_url = '/images/blog/county-fa-checklist-cover.webp'
WHERE id = '235320f7-c094-497a-8d2c-5e06e7b8aa8c';

UPDATE blog_posts 
SET cover_image_url = '/images/blog/uk-tournaments-2025-cover.webp'
WHERE id = '678c0982-a431-4910-b18f-62e42d9314d2';