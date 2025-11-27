-- Add is_published field to tournaments table
ALTER TABLE tournaments 
ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT false;

-- Create index for faster queries on published tournaments
CREATE INDEX idx_tournaments_is_published ON tournaments(is_published);

-- Update RLS policy: only published tournaments are viewable by public
DROP POLICY IF EXISTS "Tournaments are viewable by everyone" ON tournaments;

CREATE POLICY "Published tournaments are viewable by everyone"
ON tournaments FOR SELECT
USING (is_published = true);

-- Admins can view all tournaments (including pending)
CREATE POLICY "Admins can view all tournaments"
ON tournaments FOR SELECT
USING (
  (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
);

-- Organizers can view their own tournaments (even if not published)
CREATE POLICY "Organizers can view their own tournaments"
ON tournaments FOR SELECT
USING (auth.uid() = organizer_id);

-- Admins can publish/unpublish tournaments
CREATE POLICY "Admins can update all tournaments"
ON tournaments FOR UPDATE
USING (
  (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'admin'
);

-- Set all existing tournaments as published (for backward compatibility)
UPDATE tournaments SET is_published = true WHERE is_published = false;