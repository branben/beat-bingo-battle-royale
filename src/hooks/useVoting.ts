
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Vote {
  id: string;
  match_id: string;
  voter_id: string;
  voted_for_id: string;
  round_number: number;
  vote_power: number;
  voter?: {
    username: string;
  };
}

export interface RoundResult {
  winner: string;
  totalVotes: number;
  totalPower: number;
}

// Fetch votes for a specific match and round
export const useMatchVotes = (matchId: string, roundNumber: number) => {
  return useQuery({
    queryKey: ['match-votes', matchId, roundNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('votes')
        .select(`
          *,
          voter:users!votes_voter_id_fkey(username)
        `)
        .eq('match_id', matchId)
        .eq('round_number', roundNumber);
      
      if (error) throw error;
      
      // Transform data to match Vote interface
      const transformedData = data?.map(vote => ({
        id: vote.id,
        match_id: vote.match_id,
        voter_id: vote.voter_id,
        voted_for_id: vote.voted_for_id,
        round_number: vote.round_number,
        vote_power: vote.vote_power,
        voter: vote.voter
      })) as Vote[];
      
      return transformedData;
    },
    enabled: !!matchId && roundNumber > 0
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
      // Check if user already voted this round
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('match_id', matchId)
        .eq('voter_id', voterId)
        .eq('round_number', roundNumber)
        .single();
      
      if (existingVote) {
        throw new Error('You have already voted this round');
      }

      const { data, error } = await supabase
        .from('votes')
        .insert({
          match_id: matchId,
          voter_id: voterId,
          voted_for_id: votedForPlayerId,
          round_number: roundNumber,
          voter_spectator_elo: voterElo,
          vote_power: voterElo / 1000 // Convert ELO to vote power
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['match-votes', variables.matchId, variables.roundNumber] 
      });
    }
  });
};

// Get round results
export const useRoundResults = (matchId: string, roundNumber: number) => {
  return useQuery({
    queryKey: ['round-results', matchId, roundNumber],
    queryFn: async () => {
      const { data: votes, error } = await supabase
        .from('votes')
        .select('voted_for_id, vote_power')
        .eq('match_id', matchId)
        .eq('round_number', roundNumber);
      
      if (error) throw error;
      
      if (!votes || votes.length === 0) {
        return null;
      }
      
      // Calculate totals for each player
      const voteTotals: Record<string, { votes: number; power: number }> = {};
      
      votes.forEach(vote => {
        if (!voteTotals[vote.voted_for_id]) {
          voteTotals[vote.voted_for_id] = { votes: 0, power: 0 };
        }
        voteTotals[vote.voted_for_id].votes += 1;
        voteTotals[vote.voted_for_id].power += vote.vote_power;
      });
      
      // Find winner (highest vote power)
      let winner = '';
      let maxPower = 0;
      
      Object.entries(voteTotals).forEach(([playerId, totals]) => {
        if (totals.power > maxPower) {
          maxPower = totals.power;
          winner = playerId;
        }
      });
      
      return {
        winner,
        totalVotes: votes.length,
        totalPower: maxPower
      } as RoundResult;
    },
    enabled: !!matchId && roundNumber > 0
  });
};
