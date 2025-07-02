import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Vote {
  id: string;
  created_at: string;
  match_id: string;
  voter_id: string;
  round_number: number;
  genre: string;
  voted_for_player_id: string;
  voter_elo_at_time: number;
  vote_power: number;
  is_correct?: boolean;
  // Joined data
  voter?: {
    id: string;
    username: string;
    spectator_elo: number;
  };
  voted_for_player?: {
    id: string;
    username: string;
  };
}

// Get votes for a specific match and round
export const useMatchVotes = (matchId: string, roundNumber?: number) => {
  return useQuery({
    queryKey: ['votes', matchId, roundNumber],
    queryFn: async () => {
      let query = supabase
        .from('votes')
        .select(`
          *,
          voter:users!votes_voter_id_fkey(id, username, spectator_elo),
          voted_for_player:users!votes_voted_for_player_id_fkey(id, username)
        `)
        .eq('match_id', matchId);

      if (roundNumber !== undefined) {
        query = query.eq('round_number', roundNumber);
      }

      const { data, error } = await query.order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Vote[];
    },
    enabled: !!matchId
  });
};

// Submit a vote
export const useSubmitVote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      matchId, 
      voterId, 
      roundNumber, 
      genre, 
      votedForPlayerId, 
      voterElo 
    }: {
      matchId: string;
      voterId: string;
      roundNumber: number;
      genre: string;
      votedForPlayerId: string;
      voterElo: number;
    }) => {
      // Calculate vote power based on ELO (1.0x to 2.5x)
      const votePower = Math.min(2.5, Math.max(1.0, voterElo / 1000));
      
      const { data, error } = await supabase
        .from('votes')
        .insert({
          match_id: matchId,
          voter_id: voterId,
          round_number: roundNumber,
          genre: genre,
          voted_for_player_id: votedForPlayerId,
          voter_elo_at_time: voterElo,
          vote_power: votePower
        })
        .select(`
          *,
          voter:users!votes_voter_id_fkey(id, username, spectator_elo),
          voted_for_player:users!votes_voted_for_player_id_fkey(id, username)
        `)
        .single();
      
      if (error) {
        // Check if it's a duplicate vote error
        if (error.code === '23505') {
          throw new Error('You have already voted for this round');
        }
        throw error;
      }
      
      return data as Vote;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['votes', data.match_id, data.round_number] });
      queryClient.invalidateQueries({ queryKey: ['votes', data.match_id] });
    }
  });
};

// Calculate voting results for a round
export const useRoundResults = (matchId: string, roundNumber: number) => {
  return useQuery({
    queryKey: ['round-results', matchId, roundNumber],
    queryFn: async () => {
      const { data: votes, error } = await supabase
        .from('votes')
        .select(`
          *,
          voter:users!votes_voter_id_fkey(id, username, spectator_elo),
          voted_for_player:users!votes_voted_for_player_id_fkey(id, username)
        `)
        .eq('match_id', matchId)
        .eq('round_number', roundNumber);
      
      if (error) throw error;

      // Calculate weighted vote totals
      const voteTotals: Record<string, { votes: number; power: number; voters: string[] }> = {};
      
      votes.forEach((vote: Vote) => {
        const playerId = vote.voted_for_player_id;
        if (!voteTotals[playerId]) {
          voteTotals[playerId] = { votes: 0, power: 0, voters: [] };
        }
        voteTotals[playerId].votes += 1;
        voteTotals[playerId].power += vote.vote_power;
        voteTotals[playerId].voters.push(vote.voter?.username || 'Unknown');
      });

      // Determine winner (highest weighted vote power)
      let winner: string | null = null;
      let maxPower = 0;
      
      Object.entries(voteTotals).forEach(([playerId, totals]) => {
        if (totals.power > maxPower) {
          maxPower = totals.power;
          winner = playerId;
        }
      });

      return {
        votes: votes as Vote[],
        totals: voteTotals,
        winner,
        totalVotes: votes.length,
        totalPower: Object.values(voteTotals).reduce((sum, t) => sum + t.power, 0)
      };
    },
    enabled: !!matchId && roundNumber !== undefined
  });
};

// Update vote correctness after match completion
export const useUpdateVoteCorrectness = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ matchId, winnerId }: { matchId: string; winnerId: string }) => {
      // Mark all votes for the winner as correct
      const { error } = await supabase
        .from('votes')
        .update({ is_correct: true })
        .eq('match_id', matchId)
        .eq('voted_for_player_id', winnerId);
      
      if (error) throw error;

      // Mark all other votes as incorrect
      const { error: incorrectError } = await supabase
        .from('votes')
        .update({ is_correct: false })
        .eq('match_id', matchId)
        .neq('voted_for_player_id', winnerId);
      
      if (incorrectError) throw incorrectError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes'] });
    }
  });
};
