-- Add country field to tournaments table for international geocoding support
ALTER TABLE tournaments ADD COLUMN country text NOT NULL DEFAULT 'GB';

-- Update existing tournaments with proper country codes based on their data
UPDATE tournaments SET country = 'ES' WHERE name ILIKE '%Madrid%';
UPDATE tournaments SET country = 'AT' WHERE name ILIKE '%Austria%';
UPDATE tournaments SET country = 'GB' WHERE country = 'GB'; -- Keep UK tournaments as GB

-- Create index on country for better query performance
CREATE INDEX idx_tournaments_country ON tournaments(country);