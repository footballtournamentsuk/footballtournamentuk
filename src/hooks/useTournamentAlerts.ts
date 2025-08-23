import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTournamentAlerts = () => {
  const processedTournaments = useRef(new Set<string>());

  useEffect(() => {
    // Listen for tournament creation events
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
          const tournamentId = payload.new.id;
          
          // Prevent duplicate processing of the same tournament
          if (processedTournaments.current.has(tournamentId)) {
            console.log('Tournament already processed, skipping:', tournamentId);
            return;
          }
          
          processedTournaments.current.add(tournamentId);
          
          console.log('New tournament created, triggering instant alerts:', payload.new);
          
          try {
            // Call the instant alerts function
            const { data, error } = await supabase.functions.invoke('alerts-instant', {
              body: {
                tournamentId: tournamentId,
                action: 'created'
              }
            });

            if (error) {
              console.error('Error calling instant alerts function:', error);
            } else {
              console.log('Instant alerts function called successfully:', data);
            }

            // Send confirmation email to tournament creator
            const { data: emailData, error: emailError } = await supabase.functions.invoke('send-email', {
              body: {
                type: 'tournament_created',
                to: payload.new.contact_email,
                data: {
                  userName: payload.new.contact_name,
                  tournamentName: payload.new.name,
                  tournamentUrl: `https://footballtournamentsuk.co.uk/tournaments/${payload.new.slug || payload.new.id}`,
                  dateRange: new Date(payload.new.start_date).toLocaleDateString() + 
                           (payload.new.end_date !== payload.new.start_date ? 
                            ' - ' + new Date(payload.new.end_date).toLocaleDateString() : ''),
                  location: payload.new.location_name
                }
              }
            });

            if (emailError) {
              console.error('Error sending creator confirmation email:', emailError);
            } else {
              console.log('Creator confirmation email sent successfully:', emailData);
            }
          } catch (error) {
            console.error('Failed to process tournament creation:', error);
          }
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