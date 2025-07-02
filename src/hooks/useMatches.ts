import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GameState, Player } from '@/types/game';
import { generateBingoCard } from '@/utils/gameLogic';

export interface Match {
  id: string;
  created_at: string;
  updated_at: string;
  match_number: number;
  status: 'waiting' | 'active' | 'voting' | 'finished' | 'cancelled';
  player1_id: string;
  player2_id: string;
  winner_id?: string;
  current_round: number;
  called_genres: string[];
  current_genre?: string;
  player1_card: string[][];
  player2_card: string[][];
  round_start_time?: string;
  voting_deadline?: string;
  spectator_count: number;
  total_rounds: number;
  match_duration_seconds?: number;
  discord_channel_id?: string;
  discord_guild_id?: string;
  // Joined user data
  player1?: Player;
  player2?: Player;
  winner?: Player;
}

// Fetch all active matches
export const useMatches = () => {
  return useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          player1:users!matches_player1_id_fkey(*),
          player2:users!matches_player2_id_fkey(*),
          winner:users!matches_winner_id_fkey(*)
        `)
        .in('status', ['waiting', 'active', 'voting'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as Match[];
    }
  });
};

// Fetch a specific match by ID
export const useMatch = (matchId: string) => {
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          player1:users!matches_player1_id_fkey(*),
          player2:users!matches_player2_id_fkey(*),
          winner:users!matches_winner_id_fkey(*)
        `)
        .eq('id', matchId)
        .single();
      
      if (error) throw error;
      return data as unknown as Match;
    },
    enabled: !!matchId
  });
};

// Create a new match
export const useCreateMatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ player1Id, player2Id }: { player1Id: string; player2Id: string | null }) => {
      // Generate bingo cards for both players
      const player1Card = generateBingoCard();
      const player2Card = generateBingoCard();
      
      const { data, error } = await supabase
        .from('matches')
        .insert({
          player1_id: player1Id,
          player2_id: player2Id,
          status: 'waiting',
          player1_card: player1Card.squares,
          player2_card: player2Card.squares,
          current_round: 0,
          called_genres: [],
          spectator_count: 0,
          total_rounds: 0
        })
        .select(`
          *,
          player1:users!matches_player1_id_fkey(*),
          player2:users!matches_player2_id_fkey(*),
          winner:users!matches_winner_id_fkey(*)
        `)
        .single();
      
      if (error) throw error;
      return data as unknown as Match;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    }
  });
};

// Join an existing match as player 2
export const useJoinMatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ matchId, playerId }: { matchId: string; playerId: string }) => {
      const { data, error } = await supabase
        .from('matches')
        .update({ 
          player2_id: playerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', matchId)
        .eq('status', 'waiting')
        .is('player2_id', null)
        .select(`
          *,
          player1:users!matches_player1_id_fkey(*),
          player2:users!matches_player2_id_fkey(*),
          winner:users!matches_winner_id_fkey(*)
        `)
        .single();
      
      if (error) throw error;
      return data as Match;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['match', data.id] });
    }
  });
};

// Update match status
export const useUpdateMatchStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ matchId, status, updates }: { 
      matchId: string; 
      status: Match['status'];
      updates?: Partial<Match>;
    }) => {
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString(),
        ...updates
      };

      const { data, error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', matchId)
        .select(`
          *,
          player1:users!matches_player1_id_fkey(*),
          player2:users!matches_player2_id_fkey(*),
          winner:users!matches_winner_id_fkey(*)
        `)
        .single();
      
      if (error) throw error;
      return data as Match;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['match', data.id] });
    }
  });
};

// Convert Match to GameState for compatibility with existing components
export const matchToGameState = (match: Match, spectators: Player[] = []): GameState => {
  const player1: Player = match.player1 ? {
    id: match.player1.id,
    username: match.player1.username,
    competitor_elo: match.player1.competitor_elo,
    spectator_elo: match.player1.spectator_elo,
    wins: match.player1.games_won,
    losses: match.player1.games_played - match.player1.games_won,
    correct_votes: match.player1.total_votes_received,
    coins: match.player1.coins,
    role: match.player1.competitor_elo >= 1200 ? 'Gold II' : 'Silver III'
  } : {} as Player;

  const player2: Player = match.player2 ? {
    id: match.player2.id,
    username: match.player2.username,
    competitor_elo: match.player2.competitor_elo,
    spectator_elo: match.player2.spectator_elo,
    wins: match.player2.games_won,
    losses: match.player2.games_played - match.player2.games_won,
    correct_votes: match.player2.total_votes_received,
    coins: match.player2.coins,
    role: match.player2.competitor_elo >= 1200 ? 'Gold II' : 'Silver III'
  } : {} as Player;

  return {
    id: match.id,
    status: match.status === 'cancelled' ? 'finished' : match.status,
    currentRound: match.current_round,
    calledGenres: Array.isArray(match.called_genres) ? match.called_genres : [],
    currentGenre: match.current_genre,
    players: [player1, player2],
    spectators: spectators,
    player1Card: { squares: match.player1_card || [], marked: [] },
    player2Card: { squares: match.player2_card || [], marked: [] },
    roundStartTime: match.round_start_time ? new Date(match.round_start_time).getTime() : undefined,
    voting_deadline: match.voting_deadline ? new Date(match.voting_deadline) : undefined,
    winner: match.winner_id,
    spectatorCount: match.spectator_count,
    totalRounds: match.total_rounds,
    matchNumber: match.match_number,
    
    // Legacy properties for backward compatibility
    player1,
    player2,
    player1_card: { squares: match.player1_card || [], marked: [] },
    player2_card: { squares: match.player2_card || [], marked: [] },
    called_genres: Array.isArray(match.called_genres) ? match.called_genres : [],
    current_call: match.current_genre,
    votes: {},
    handicaps_used: [],
    winner_id: match.winner_id
  };
};
