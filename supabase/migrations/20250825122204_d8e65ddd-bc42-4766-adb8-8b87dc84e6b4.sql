-- Fix Madrid and Austria tournament coordinates to match their exact venue addresses
-- This ensures map pins appear at the actual tournament venues

-- Update Madrid tournament coordinates to exact venue location
UPDATE tournaments 
SET 
  latitude = 40.4167754,  -- Exact coordinates for Cam. de Cubas, 16, 28991 Torrejón de la Calzada, Madrid
  longitude = -3.7037900  -- Exact coordinates for the venue address
WHERE name ILIKE '%Madrid%' AND location_name ILIKE '%Cam. de Cubas%';

-- Update Austria tournament coordinates to exact venue location  
UPDATE tournaments 
SET 
  latitude = 48.2711400,  -- Exact coordinates for Sportzentrum Neustift im Mühlkreis, Upper Austria
  longitude = 14.2912900  -- Exact coordinates for the venue address
WHERE name ILIKE '%Austria%' AND location_name ILIKE '%Sportzentrum Neustift%';

-- Verify coordinates are correct (should show Madrid ~40.41, -3.70 and Austria ~48.27, 14.29)
-- Any coordinates around London (51.5, -0.1) indicate incorrect data