import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeFeatures } from '@/hooks/useRealtimeFeatures';

export const useTournamentAlerts = () => {
  const processedTournaments = useRef(new Set<string>());
  const { isRealtimeEnabled, createRealtimeChannel } = useRealtimeFeatures();

  useEffect(() => {
    if (!isRealtimeEnabled) {
      console.log('Tournament alerts monitoring: database triggers only (sandbox mode)');
      return;
    }

    console.log('🚨 Enabling tournament alerts realtime monitoring in production');

    // Monitor tournament changes for UI feedback only
    // Actual alert processing is handled by database triggers
    const channel = createRealtimeChannel('tournament-alerts-ui', [
      {
        config: { event: 'INSERT', schema: 'public', table: 'tournaments' },
        filter: 'status=neq.draft', // Only public tournaments
        callback: (payload: any) => {
          console.log('🎯 New tournament detected for alerts UI:', payload.new?.name);
          // UI feedback only - actual alerts handled by triggers
        }
      }
    ]);

    return () => {
      if (channel) {
        console.log('🔌 Disconnecting tournament alerts realtime');
        supabase.removeChannel(channel);
      }
    };
  }, [isRealtimeEnabled, createRealtimeChannel]);
};