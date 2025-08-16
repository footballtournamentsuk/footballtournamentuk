-- Fix coordinates for tournaments with incorrect London coordinates
-- Liverpool Camp should be in Liverpool
UPDATE tournaments 
SET latitude = 53.4108, longitude = -2.9779
WHERE name = 'Liverpool Camp' AND latitude = 51.50740000;

-- Manchester League 2026 should be in Manchester  
UPDATE tournaments 
SET latitude = 53.4808, longitude = -2.2426
WHERE name = 'Manchester League 2026' AND latitude = 51.50740000;

-- Update any other tournaments that have default London coordinates but are not actually in London
-- First let's check what we have
UPDATE tournaments 
SET latitude = 51.4545, longitude = 0.0086
WHERE name = 'Karprivate Cump' AND postcode = 'TN6 2HR';