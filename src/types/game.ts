
export interface Player {
  id: string;
  discord_id?: string;
  username: string;
  competitor_elo: number;
  spectator_elo: number;
  wins: number;
  losses: number;
  correct_votes: number;
  coins: number;
  role: 'Bronze V' | 'Silver III' | 'Gold II' | 'Platinum I' | 'Diamond III' | 'Master' | 'Grandmaster';
}

export interface BingoCard {
  squares: string[][];
  marked: boolean[][];
}

export interface GameState {
  id: string;
  player1: Player;
  player2: Player;
  player1_card: BingoCard;
  player2_card: BingoCard;
  called_genres: string[];
  current_call?: string;
  spectators: Player[];
  votes: Record<string, string>; // spectator_id -> player_id
  voting_deadline?: Date;
  handicaps_used: any[];
  winner_id?: string;
  status: 'waiting' | 'active' | 'voting' | 'handicap' | 'finished';
}

export interface Vote {
  spectator_id: string;
  player_id: string;
  timestamp: Date;
  vote_power: number;
}

export interface Handicap {
  name: 'Double Trouble' | 'Blind Spot' | 'Coin Monsoon' | 'ELO Shift';
  cost: number;
  target: 'player' | 'all';
  description: string;
}

export const BEAT_GENRES = [
  'Trap', 'Hip-Hop', 'Drill', 'Boom Bap', 'Lo-Fi', 'Jazz', 'R&B', 'Soul',
  'Funk', 'Electronic', 'House', 'Techno', 'Dubstep', 'Ambient', 'Rock',
  'Metal', 'Pop', 'Country', 'Reggae', 'Latin', 'Afrobeat', 'K-Pop', 'Indie',
  'Classical', 'Blues'
];

export const HANDICAPS: Handicap[] = [
  { name: 'Double Trouble', cost: 25, target: 'player', description: '2x next reward' },
  { name: 'Blind Spot', cost: 30, target: 'player', description: 'Hide board 15s' },
  { name: 'Coin Monsoon', cost: 100, target: 'all', description: '30% pot to voters' },
  { name: 'ELO Shift', cost: 40, target: 'all', description: '±10% ELO based on vote' }
];
