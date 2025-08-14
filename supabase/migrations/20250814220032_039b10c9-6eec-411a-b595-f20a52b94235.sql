-- Create tournament_attachments table
CREATE TABLE public.tournament_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tournament_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for tournament attachments
CREATE POLICY "Attachments are viewable by everyone" 
ON public.tournament_attachments 
FOR SELECT 
USING (true);

CREATE POLICY "Tournament organizers can upload attachments" 
ON public.tournament_attachments 
FOR INSERT 
WITH CHECK (
  auth.uid() = uploaded_by AND 
  EXISTS (
    SELECT 1 FROM public.tournaments 
    WHERE id = tournament_id AND organizer_id = auth.uid()
  )
);

CREATE POLICY "Tournament organizers can update their attachments" 
ON public.tournament_attachments 
FOR UPDATE 
USING (
  auth.uid() = uploaded_by AND 
  EXISTS (
    SELECT 1 FROM public.tournaments 
    WHERE id = tournament_id AND organizer_id = auth.uid()
  )
);

CREATE POLICY "Tournament organizers can delete their attachments" 
ON public.tournament_attachments 
FOR DELETE 
USING (
  auth.uid() = uploaded_by AND 
  EXISTS (
    SELECT 1 FROM public.tournaments 
    WHERE id = tournament_id AND organizer_id = auth.uid()
  )
);

-- Create storage bucket for tournament attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tournament-attachments', 'tournament-attachments', true);

-- Create storage policies
CREATE POLICY "Tournament attachments are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'tournament-attachments');

CREATE POLICY "Tournament organizers can upload attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'tournament-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Tournament organizers can update their attachments" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'tournament-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Tournament organizers can delete their attachments" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'tournament-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_tournament_attachments_updated_at
BEFORE UPDATE ON public.tournament_attachments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();