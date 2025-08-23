-- Fix the frequency check constraint to allow instant, daily, and weekly
ALTER TABLE tournament_alerts DROP CONSTRAINT IF EXISTS tournament_alerts_frequency_check;

-- Add the correct constraint that allows instant, daily, and weekly
ALTER TABLE tournament_alerts ADD CONSTRAINT tournament_alerts_frequency_check 
CHECK (frequency IN ('instant', 'daily', 'weekly'));