-- Drop the old type constraint
ALTER TABLE public.tournaments DROP CONSTRAINT tournaments_type_check;

-- Add updated constraint with all tournament types including the new ones
ALTER TABLE public.tournaments ADD CONSTRAINT tournaments_type_check 
CHECK (
  type = ANY (ARRAY['tournament'::text, 'league'::text, 'camp'::text, 'friendly'::text, 'cup'::text, 'festival'::text, 'showcase'::text])
);