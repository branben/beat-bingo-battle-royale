
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GameState } from '@/types/game';

interface UseRealtimeSyncProps {
  matchId: string;
  onGameStateUpdate: (gameState: Partial<GameState>) => void;
  onVoteUpdate: (vote: any) => void;
  onPlayerJoin: (playerId: string) => void;
  onPlayerLeave: (playerId: string) => void;
}

export const useRealtimeSync = ({
  matchId,
  onGameStateUpdate,
  onVoteUpdate,
  onPlayerJoin,
  onPlayerLeave
}: UseRealtimeSyncProps) => {
  
  const syncGameState = useCallback(async (updates: Partial<GameState>) => {
    if (!matchId) return;
    
    try {
      const { error } = await supabase
        .from('matches')
        .update({
          status: updates.status,
          current_genre: updates.currentGenre,
          current_round: updates.currentRound,
          called_genres: updates.calledGenres,
          voting_deadline: updates.voting_deadline,
          winner_id: updates.winner_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', matchId);

      if (error) {
        console.error('Error syncing game state:', error);
      }
    } catch (error) {
      console.error('Failed to sync game state:', error);
    }
  }, [matchId]);

  const submitVote = useCallback(async (votedForPlayerId: string, voterElo: number) => {
    if (!matchId) return;
    
    try {
      const { error } = await supabase
        .from('votes')
        .insert({
          match_id: matchId,
          voter_id: 'current-user', // This should be actual user ID
          voted_for_id: votedForPlayerId,
          round_number: 1, // This should be current round
          voter_spectator_elo: voterElo,
          vote_power: Math.max(0.5, Math.min(2.0, voterElo / 1000))
        });

      if (error) {
        console.error('Error submitting vote:', error);
      }
    } catch (error) {
      console.error('Failed to submit vote:', error);
    }
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;

    // Subscribe to match changes
    const matchChannel = supabase
      .channel(`match-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`
        },
        (payload) => {
          console.log('Match updated:', payload);
          onGameStateUpdate({
            status: payload.new.status,
            currentGenre: payload.new.current_genre,
            currentRound: payload.new.current_round,
            calledGenres: payload.new.called_genres || [],
            voting_deadline: payload.new.voting_deadline,
            winner_id: payload.new.winner_id
          });
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
          onVoteUpdate(payload.new);
        }
      )
      .subscribe();

    // Subscribe to player presence
    const presenceChannel = supabase
      .channel(`presence-${matchId}`)
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState();
        console.log('Sync presence state:', newState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('Player joined:', key, newPresences);
        onPlayerJoin(key);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('Player left:', key, leftPresences);
        onPlayerLeave(key);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(matchChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [matchId, onGameStateUpdate, onVoteUpdate, onPlayerJoin, onPlayerLeave]);

  return {
    syncGameState,
    submitVote
  };
};
