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

      // Define all available tournament types (always show these regardless of database content)
      const allTournamentTypes = ['tournament', 'league', 'camp', 'cup', 'festival', 'showcase', 'friendly'];
      
      // Get unique types from database
      const existingTypes = [...new Set(data.map((item: any) => item.type))];
      
      // Combine predefined types with any additional types found in database
      const additionalTypes = existingTypes.filter(type => !allTournamentTypes.includes(type));
      const finalTypes = [...allTournamentTypes, ...additionalTypes];
      
      setTournamentTypes(finalTypes);
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