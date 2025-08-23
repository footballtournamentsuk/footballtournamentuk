import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTournamentAlerts = () => {
  const processedTournaments = useRef(new Set<string>());

  useEffect(() => {
    // Listen for tournament creation events for UI updates only
    // Instant alerts are triggered by database triggers, not client-side
    const channel = supabase
      .channel('tournament-alerts-monitor')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tournaments'
        },
        async (payload) => {
          console.log('New tournament created (UI update only):', payload.new);
          // No instant alerts processing here - handled by database trigger
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tournaments'
        },
        async (payload) => {
          // Only trigger for significant updates
          const oldData = payload.old;
          const newData = payload.new;
          
          const significantChange = (
            oldData.name !== newData.name ||
            oldData.location_name !== newData.location_name ||
            oldData.start_date !== newData.start_date ||
            oldData.end_date !== newData.end_date ||
            oldData.format !== newData.format ||
            JSON.stringify(oldData.age_groups) !== JSON.stringify(newData.age_groups) ||
            JSON.stringify(oldData.team_types) !== JSON.stringify(newData.team_types) ||
            oldData.type !== newData.type ||
            oldData.cost_amount !== newData.cost_amount ||
            oldData.registration_deadline !== newData.registration_deadline
          );

          if (significantChange) {
            console.log('Tournament updated significantly, triggering instant alerts:', newData);
            
            try {
              const { data, error } = await supabase.functions.invoke('alerts-instant', {
                body: {
                  tournamentId: newData.id,
                  action: 'updated'
                }
              });

              if (error) {
                console.error('Error calling instant alerts function:', error);
              } else {
                console.log('Instant alerts function called successfully:', data);
              }
            } catch (error) {
              console.error('Failed to trigger instant alerts:', error);
            }
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
};