import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PublishedTeam {
  id: string;
  owner_id: string;
  name: string;
  city: string;
  region: string;
  country: string;
  venue_address?: string;
  venue_latitude?: number;
  venue_longitude?: number;
  genders: string[];
  age_groups: string[];
  formats: string[];
  logo_url?: string;
  banner_url?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const useTeams = () => {
  const [teams, setTeams] = useState<PublishedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Loading published teams...');

      const { data, error: fetchError } = await supabase
        .from('teams')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Supabase error loading teams:', fetchError);
        throw fetchError;
      }

      console.log('Loaded teams:', data);
      setTeams(data || []);
    } catch (err: any) {
      console.error('Error loading teams:', err);
      setError(err.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  return { teams, loading, error, refetch: loadTeams };
};