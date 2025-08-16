-- Drop the old constraint that only allows single formats
ALTER TABLE public.tournaments DROP CONSTRAINT tournaments_format_check;

-- Add a new constraint that allows comma-separated format combinations
ALTER TABLE public.tournaments ADD CONSTRAINT tournaments_format_check 
CHECK (
  format ~ '^(3v3|5v5|7v7|9v9|11v11)(,(3v3|5v5|7v7|9v9|11v11))*$'
);