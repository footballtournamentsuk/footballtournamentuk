import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTournamentTypes = () => {
  const [tournamentTypes, setTournamentTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTournamentTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching tournament types...');

      const { data, error: supabaseError } = await supabase
        .from('tournaments')
        .select('type')
        .not('type', 'is', null);

      console.log('Raw tournament data:', data);

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw supabaseError;
      }

      // Extract unique tournament types, capitalize them, and sort
      const uniqueTypes = [...new Set(data.map(item => item.type))].sort();
      console.log('Processed unique types:', uniqueTypes);
      setTournamentTypes(uniqueTypes);
    } catch (err) {
      console.error('Error fetching tournament types:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tournament types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournamentTypes();
  }, []);

  // Force refetch on mount to ensure fresh data
  useEffect(() => {
    const timeoutId = setTimeout(fetchTournamentTypes, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  return {
    tournamentTypes,
    loading,
    error,
    refetch: fetchTournamentTypes,
  };
};