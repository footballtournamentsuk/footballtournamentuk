import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTournamentAlerts = () => {
  const processedTournaments = useRef(new Set<string>());

  useEffect(() => {
    // Real-time functionality disabled to avoid WebSocket issues
    // Tournament alerts are handled by database triggers
    console.log('Tournament alerts monitoring initialized (database triggers only)');
  }, []);
};