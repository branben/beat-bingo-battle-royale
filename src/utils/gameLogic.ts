
import { BEAT_GENRES, BingoCard, Player } from '@/types/game';

export function generateBingoCard(): BingoCard {
  const shuffled = [...BEAT_GENRES].sort(() => Math.random() - 0.5);
  const squares: string[][] = [];
  const marked: boolean[][] = [];
  
  let index = 0;
  for (let i = 0; i < 5; i++) {
    squares[i] = [];
    marked[i] = [];
    for (let j = 0; j < 5; j++) {
      if (i === 2 && j === 2) {
        squares[i][j] = 'FREE';
        marked[i][j] = true;
      } else {
        squares[i][j] = shuffled[index++];
        marked[i][j] = false;
      }
    }
  }
  
  return { squares, marked };
}

export function selectGenre(called: string[], p1_card: BingoCard, p2_card: BingoCard): string {
  const available = BEAT_GENRES.filter(genre => !called.includes(genre));
  
  const p1_genres = p1_card.squares.flat();
  const p2_genres = p2_card.squares.flat();
  const playable = available.filter(genre => 
    p1_genres.includes(genre) || p2_genres.includes(genre)
  );
  
  if (playable.length > 0) {
    return playable[Math.floor(Math.random() * playable.length)];
  }
  
  return available[Math.floor(Math.random() * available.length)];
}

export function checkBingo(card: BingoCard): boolean {
  const { marked } = card;
  
  // Check rows
  for (let i = 0; i < 5; i++) {
    if (marked[i].every(cell => cell)) return true;
  }
  
  // Check columns
  for (let j = 0; j < 5; j++) {
    if (marked.every(row => row[j])) return true;
  }
  
  // Check diagonals
  if (marked.every((row, i) => row[i])) return true;
  if (marked.every((row, i) => row[4 - i])) return true;
  
  return false;
}

export function calculateVotePower(spectator_elo: number): number {
  return Math.min(1.0 + (spectator_elo / 1000), 2.5);
}

export function getPlayerRole(elo: number): string {
  if (elo >= 3000) return 'Grandmaster';
  if (elo >= 2500) return 'Master';
  if (elo >= 2000) return 'Diamond III';
  if (elo >= 1500) return 'Platinum I';
  if (elo >= 1200) return 'Gold II';
  if (elo >= 1000) return 'Silver III';
  return 'Bronze V';
}

export function calculateEloChange(winner_elo: number, loser_elo: number): { winner_change: number, loser_change: number } {
  const K = 32;
  const expected_winner = 1 / (1 + Math.pow(10, (loser_elo - winner_elo) / 400));
  const expected_loser = 1 / (1 + Math.pow(10, (winner_elo - loser_elo) / 400));
  
  const winner_change = Math.round(K * (1 - expected_winner));
  const loser_change = Math.round(K * (0 - expected_loser));
  
  return { winner_change, loser_change };
}
