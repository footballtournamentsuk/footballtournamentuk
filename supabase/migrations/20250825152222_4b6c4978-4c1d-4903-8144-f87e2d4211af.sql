-- Enable leaked password protection for improved security
-- This will prevent users from using passwords that have been compromised in data breaches

UPDATE auth.config 
SET breach_detection_enabled = true 
WHERE id = 'breach_detection_enabled';