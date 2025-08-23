-- Fix RLS policies to allow alert creation from edge functions
-- Add INSERT policy for tournament_alerts table to allow edge function to create alerts
CREATE POLICY "Allow edge functions to insert alerts" 
ON public.tournament_alerts 
FOR INSERT 
WITH CHECK (true);

-- Add INSERT policy for alert_deliveries table to allow edge function to track deliveries
CREATE POLICY "Allow edge functions to insert deliveries" 
ON public.alert_deliveries 
FOR INSERT 
WITH CHECK (true);