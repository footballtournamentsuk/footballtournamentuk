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

      const { data, error: supabaseError } = await supabase
        .from('tournaments')
        .select('type')
        .not('type', 'is', null);

      if (supabaseError) {
        throw supabaseError;
      }

      // Extract unique tournament types and sort them
      const uniqueTypes = [...new Set(data.map(item => item.type))].sort();
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

  return {
    tournamentTypes,
    loading,
    error,
    refetch: fetchTournamentTypes,
  };
};