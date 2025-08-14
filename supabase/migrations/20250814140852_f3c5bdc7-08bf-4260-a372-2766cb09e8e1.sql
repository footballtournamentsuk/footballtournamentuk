-- Create a profile for existing users who don't have one
INSERT INTO public.profiles (user_id, contact_email, full_name)
SELECT 
    id as user_id,
    email as contact_email,
    COALESCE(raw_user_meta_data ->> 'full_name', '') as full_name
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT (user_id) DO NOTHING;