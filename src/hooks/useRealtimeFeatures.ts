import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Feature flag for realtime functionality - enabled in production only
const ENABLE_REALTIME = window.location.hostname.includes('footballtournamentsuk.co.uk');

export const useRealtimeFeatures = () => {
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(ENABLE_REALTIME);
  const channelsRef = useRef<any[]>([]);

  const enableRealtime = () => setIsRealtimeEnabled(true);
  const disableRealtime = () => {
    // Cleanup existing channels
    channelsRef.current.forEach(channel => {
      supabase.removeChannel(channel);
    });
    channelsRef.current = [];
    setIsRealtimeEnabled(false);
  };

  const createRealtimeChannel = (channelName: string, config: any) => {
    if (!isRealtimeEnabled) return null;

    try {
      const channel = supabase.channel(channelName);
      
      // Add RLS-safe configuration with error boundary
      config.forEach((item: any) => {
        channel.on('postgres_changes', {
          ...item.config,
          // Ensure RLS policies are respected - only public data
          filter: item.filter || 'status=neq.draft'
        }, (payload: any) => {
          try {
            item.callback(payload);
          } catch (error) {
            console.warn(`Realtime callback error for ${channelName}:`, error);
            // Graceful degradation - don't break UI
          }
        });
      });

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Realtime channel ${channelName} connected in production`);
        } else if (status === 'CHANNEL_ERROR') {
          console.warn(`❌ Realtime channel ${channelName} failed, falling back to polling`);
        }
      });
      
      channelsRef.current.push(channel);
      return channel;
    } catch (error) {
      console.warn('Realtime channel creation failed, graceful fallback:', error);
      return null;
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      disableRealtime();
    };
  }, []);

  return {
    isRealtimeEnabled,
    enableRealtime,
    disableRealtime,
    createRealtimeChannel
  };
};

// Tournament-specific realtime hook with production-only activation
export const useTournamentRealtime = (onTournamentChange?: (tournament: any) => void) => {
  const { isRealtimeEnabled, createRealtimeChannel } = useRealtimeFeatures();

  useEffect(() => {
    if (!isRealtimeEnabled || !onTournamentChange) {
      console.log('Tournament realtime disabled - sandbox mode or no callback');
      return;
    }

    console.log('🔄 Enabling tournament realtime in production');
    
    const channel = createRealtimeChannel('tournament-updates-prod', [
      {
        config: { event: 'INSERT', schema: 'public', table: 'tournaments' },
        filter: 'status=neq.draft', // Only public tournaments, RLS-safe
        callback: (payload: any) => {
          console.log('🆕 New tournament via realtime:', payload.new?.name);
          onTournamentChange(payload.new);
        }
      },
      {
        config: { event: 'UPDATE', schema: 'public', table: 'tournaments' },
        filter: 'status=neq.draft', // Only public tournaments
        callback: (payload: any) => {
          console.log('🔄 Tournament updated via realtime:', payload.new?.name);
          onTournamentChange(payload.new);
        }
      }
    ]);

    return () => {
      if (channel) {
        console.log('🔌 Disconnecting tournament realtime');
        supabase.removeChannel(channel);
      }
    };
  }, [isRealtimeEnabled, onTournamentChange, createRealtimeChannel]);
};