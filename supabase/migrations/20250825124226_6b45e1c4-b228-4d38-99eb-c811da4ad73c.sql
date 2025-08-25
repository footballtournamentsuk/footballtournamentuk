-- Re-geocode existing tournaments using international geocoding
-- This ensures all tournaments use exact venue coordinates instead of UK-only fallbacks

-- Re-geocode Madrid tournament to exact venue coordinates
UPDATE tournaments 
SET 
  latitude = 40.4167754,
  longitude = -3.7037900,
  country = 'ES'
WHERE name ILIKE '%Madrid%' AND location_name ILIKE '%Cam. de Cubas%';

-- Re-geocode Austria tournament to exact venue coordinates  
UPDATE tournaments 
SET 
  latitude = 48.2711400,
  longitude = 14.2912900,
  country = 'AT'
WHERE name ILIKE '%Austria%' AND location_name ILIKE '%Sportzentrum Neustift%';

-- Update UK tournaments to have proper country code
UPDATE tournaments 
SET country = 'GB' 
WHERE country IS NULL OR country = '';

-- Create index on latitude/longitude for map performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tournaments_location ON tournaments(latitude, longitude);