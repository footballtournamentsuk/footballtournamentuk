-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location_name TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  postcode TEXT NOT NULL,
  region TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('3v3', '5v5', '7v7', '9v9', '11v11')),
  age_groups TEXT[] NOT NULL,
  team_types TEXT[] NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('league', 'tournament', 'camp', 'holiday')),
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  max_teams INTEGER,
  registered_teams INTEGER DEFAULT 0,
  cost_amount DECIMAL(10, 2),
  cost_currency TEXT DEFAULT 'GBP',
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website TEXT,
  features TEXT[],
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (tournaments are publicly viewable)
CREATE POLICY "Tournaments are viewable by everyone" 
ON public.tournaments 
FOR SELECT 
USING (true);

-- Create policies for organizers to manage their own tournaments
CREATE POLICY "Organizers can create tournaments" 
ON public.tournaments 
FOR INSERT 
WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their own tournaments" 
ON public.tournaments 
FOR UPDATE 
USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their own tournaments" 
ON public.tournaments 
FOR DELETE 
USING (auth.uid() = organizer_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tournaments_updated_at
BEFORE UPDATE ON public.tournaments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some test tournament data
INSERT INTO public.tournaments (
  name, description, location_name, latitude, longitude, postcode, region,
  format, age_groups, team_types, type, start_date, end_date,
  contact_name, contact_email, features
) VALUES 
(
  'Manchester Youth League',
  'Weekly youth football league for local teams',
  'Etihad Campus',
  53.4831, -2.2004,
  'M11 3FF',
  'Greater Manchester',
  '11v11',
  ARRAY['U12', 'U14', 'U16'],
  ARRAY['boys', 'girls'],
  'league',
  '2024-09-01T10:00:00Z',
  '2024-12-15T16:00:00Z',
  'John Smith',
  'john@manchesteryouth.com',
  ARRAY['Professional pitches', 'Changing rooms', 'Parking']
),
(
  'London 5v5 Tournament',
  'Fast-paced 5v5 tournament in central London',
  'Hyde Park',
  51.5074, -0.1278,
  'W2 2UH',
  'London',
  '5v5',
  ARRAY['U10', 'U12'],
  ARRAY['mixed'],
  'tournament',
  '2024-08-20T09:00:00Z',
  '2024-08-20T18:00:00Z',
  'Sarah Johnson',
  'sarah@london5v5.com',
  ARRAY['Trophies', 'Refreshments', 'Photography']
),
(
  'Birmingham Summer Camp',
  'Week-long football development camp',
  'Villa Park Training Ground',
  52.5091, -1.8840,
  'B6 6HE',
  'West Midlands',
  '7v7',
  ARRAY['U8', 'U10'],
  ARRAY['boys', 'girls'],
  'camp',
  '2024-08-26T09:00:00Z',
  '2024-08-30T16:00:00Z',
  'Mike Wilson',
  'mike@birminghamcamp.com',
  ARRAY['Professional coaching', 'Equipment provided', 'Lunch included']
);