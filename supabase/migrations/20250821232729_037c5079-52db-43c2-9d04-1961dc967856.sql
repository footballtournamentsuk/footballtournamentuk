-- Create tournament alerts system for email-only notifications
CREATE TABLE public.tournament_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  filters jsonb NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('daily','weekly')),
  is_active boolean DEFAULT false,
  verified_at timestamptz,
  verification_token text NOT NULL UNIQUE,
  management_token text NOT NULL UNIQUE,
  last_sent_at timestamptz,
  consent_timestamp timestamptz NOT NULL DEFAULT now(),
  consent_source text NOT NULL, -- 'list', 'city', 'filters', 'empty'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.alert_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid REFERENCES public.tournament_alerts(id) ON DELETE CASCADE,
  sent_at timestamptz DEFAULT now(),
  item_count int NOT NULL,
  status text NOT NULL CHECK (status IN ('sent','failed')),
  error text
);

-- Indexes for performance
CREATE INDEX idx_alerts_active_email ON public.tournament_alerts(email) WHERE is_active = true;
CREATE INDEX idx_alerts_filters_gin ON public.tournament_alerts USING GIN (filters);
CREATE INDEX idx_alerts_verification_token ON public.tournament_alerts(verification_token);
CREATE INDEX idx_alerts_management_token ON public.tournament_alerts(management_token);
CREATE INDEX idx_alerts_frequency_active ON public.tournament_alerts(frequency) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.tournament_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tournament_alerts
CREATE POLICY "Users can view alerts by management token" 
ON public.tournament_alerts 
FOR SELECT 
USING (true); -- Will be filtered by management_token in edge functions

CREATE POLICY "Users can update alerts by management token" 
ON public.tournament_alerts 
FOR UPDATE 
USING (true); -- Will be filtered by management_token in edge functions

CREATE POLICY "Users can delete alerts by management token" 
ON public.tournament_alerts 
FOR DELETE 
USING (true); -- Will be filtered by management_token in edge functions

CREATE POLICY "Admins can view all alerts" 
ON public.tournament_alerts 
FOR SELECT 
USING (is_admin());

-- RLS Policies for alert_deliveries
CREATE POLICY "Admins can view all deliveries" 
ON public.alert_deliveries 
FOR SELECT 
USING (is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_tournament_alerts_updated_at
BEFORE UPDATE ON public.tournament_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();