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

      // Define the desired order and extract unique tournament types
      const desiredOrder = ['league', 'tournament', 'camp', 'holiday', 'cup', 'festival', 'showcase'];
      const uniqueTypes = [...new Set(data.map(item => item.type))];
      
      // Sort according to desired order, then alphabetically for any not in the list
      const sortedTypes = uniqueTypes.sort((a, b) => {
        const indexA = desiredOrder.indexOf(a);
        const indexB = desiredOrder.indexOf(b);
        
        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        } else if (indexA !== -1) {
          return -1;
        } else if (indexB !== -1) {
          return 1;
        } else {
          return a.localeCompare(b);
        }
      });
      
      setTournamentTypes(sortedTypes);
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