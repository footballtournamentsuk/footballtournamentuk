import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Feature flag for realtime functionality
const ENABLE_REALTIME = false; // Set to true when WebSocket issues are resolved

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
      
      // Add RLS-safe configuration
      config.forEach((item: any) => {
        channel.on('postgres_changes', {
          ...item.config,
          // Ensure RLS policies are respected
          filter: item.filter
        }, item.callback);
      });

      channel.subscribe();
      channelsRef.current.push(channel);
      return channel;
    } catch (error) {
      console.warn('Realtime channel creation failed:', error);
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

// Tournament-specific realtime hook
export const useTournamentRealtime = (onTournamentChange?: (tournament: any) => void) => {
  const { isRealtimeEnabled, createRealtimeChannel } = useRealtimeFeatures();

  useEffect(() => {
    if (!isRealtimeEnabled || !onTournamentChange) return;

    const channel = createRealtimeChannel('tournament-updates', [
      {
        config: { event: 'INSERT', schema: 'public', table: 'tournaments' },
        filter: 'status=eq.upcoming', // RLS-safe filter
        callback: (payload: any) => onTournamentChange(payload.new)
      },
      {
        config: { event: 'UPDATE', schema: 'public', table: 'tournaments' },
        filter: 'status=neq.draft', // Only public tournaments
        callback: (payload: any) => onTournamentChange(payload.new)
      }
    ]);

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [isRealtimeEnabled, onTournamentChange, createRealtimeChannel]);
};