
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useGameRealtime = (matchId: string, currentRound: number) => {
  useEffect(() => {
    if (!matchId) return;

    const channel = supabase
      .channel('game-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`
        },
        (payload) => {
          console.log('Match update:', payload);
          // Handle real-time match updates
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          console.log('New vote:', payload);
          // Handle real-time vote updates
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, currentRound]);
};
