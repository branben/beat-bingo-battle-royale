import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

// Hook for real-time match updates
export const useMatchRealtime = (matchId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!matchId) return;

    const channel: RealtimeChannel = supabase
      .channel(`match-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`
        },
        (payload) => {
          console.log('🔄 Match update received:', payload);
          // Invalidate and refetch match data
          queryClient.invalidateQueries({ queryKey: ['match', matchId] });
          queryClient.invalidateQueries({ queryKey: ['matches'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, queryClient]);
};

// Hook for real-time voting updates
export const useVotingRealtime = (matchId: string, roundNumber?: number) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!matchId) return;

    const channel: RealtimeChannel = supabase
      .channel(`votes-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          console.log('🗳️ Vote update received:', payload);
          // Invalidate voting queries
          queryClient.invalidateQueries({ queryKey: ['votes', matchId] });
          if (roundNumber !== undefined) {
            queryClient.invalidateQueries({ queryKey: ['votes', matchId, roundNumber] });
            queryClient.invalidateQueries({ queryKey: ['round-results', matchId, roundNumber] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, roundNumber, queryClient]);
};

// Hook for spectator count updates
export const useSpectatorRealtime = (matchId: string) => {
  const queryClient = useQueryClient();

  const updateSpectatorCount = useCallback(async (increment: boolean) => {
    if (!matchId) return;

    try {
      const { error } = await supabase.rpc('update_spectator_count', {
        match_id: matchId,
        increment: increment
      });

      if (error) {
        console.error('Error updating spectator count:', error);
        return;
      }

      // Invalidate match data to reflect updated spectator count
      queryClient.invalidateQueries({ queryKey: ['match', matchId] });
    } catch (error) {
      console.error('Error updating spectator count:', error);
    }
  }, [matchId, queryClient]);

  // Auto-increment spectator count when joining a match
  useEffect(() => {
    if (!matchId) return;

    updateSpectatorCount(true);

    // Decrement when leaving (cleanup)
    return () => {
      updateSpectatorCount(false);
    };
  }, [matchId, updateSpectatorCount]);

  return { updateSpectatorCount };
};

// Hook for comprehensive real-time match experience
export const useGameRealtime = (matchId: string, roundNumber?: number) => {
  // Enable all real-time features for a game
  useMatchRealtime(matchId);
  useVotingRealtime(matchId, roundNumber);
  const { updateSpectatorCount } = useSpectatorRealtime(matchId);

  return { updateSpectatorCount };
};
