-- Add image position field to tournaments table
ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS banner_position text DEFAULT 'center';

COMMENT ON COLUMN tournaments.banner_position IS 'CSS object-position value for banner image (e.g., "center", "top", "bottom", "left", "right", "50% 25%")';