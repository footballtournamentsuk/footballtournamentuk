-- Add extended content fields to tournaments table for individual tournament pages
ALTER TABLE public.tournaments 
ADD COLUMN IF NOT EXISTS extended_description TEXT,
ADD COLUMN IF NOT EXISTS venue_details TEXT,
ADD COLUMN IF NOT EXISTS rules_and_regulations TEXT,
ADD COLUMN IF NOT EXISTS what_to_bring TEXT,
ADD COLUMN IF NOT EXISTS accommodation_info TEXT,
ADD COLUMN IF NOT EXISTS gallery_images TEXT[],
ADD COLUMN IF NOT EXISTS social_media_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sponsor_info TEXT,
ADD COLUMN IF NOT EXISTS schedule_details TEXT,
ADD COLUMN IF NOT EXISTS prize_information TEXT,
ADD COLUMN IF NOT EXISTS additional_notes TEXT;