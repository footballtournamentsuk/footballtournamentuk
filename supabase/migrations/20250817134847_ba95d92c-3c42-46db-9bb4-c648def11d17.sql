-- Add consent tracking to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS data_processing_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_date TIMESTAMP WITH TIME ZONE;

-- Add email change tracking fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pending_email_change TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_change_token TEXT;