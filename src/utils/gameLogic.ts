
import { BingoCard, BEAT_GENRES } from '@/types/game';

export const generateBingoCard = (): BingoCard => {
  // Shuffle genres and take first 25
  const shuffledGenres = [...BEAT_GENRES].sort(() => Math.random() - 0.5);
  const selectedGenres = shuffledGenres.slice(0, 25);
  
  // Create 5x5 grid
  const squares: string[][] = [];
  const marked: boolean[][] = [];
  
  for (let i = 0; i < 5; i++) {
    squares[i] = [];
    marked[i] = [];
    for (let j = 0; j < 5; j++) {
      squares[i][j] = selectedGenres[i * 5 + j];
      marked[i][j] = false;
    }
  }
  
  return { squares, marked };
};

export const selectGenre = (
  player1Genres: string[],
  player2Genres: string[],
  calledGenres: string[]
): string => {
  // Get all unique genres from both players that haven't been called
  const allGenres = [...new Set([...player1Genres, ...player2Genres])];
  const availableGenres = allGenres.filter(genre => !calledGenres.includes(genre));
  
  if (availableGenres.length === 0) {
    return ''; // No more genres to call
  }
  
  // Randomly select from available genres
  const randomIndex = Math.floor(Math.random() * availableGenres.length);
  return availableGenres[randomIndex];
};

export const checkBingo = (card: BingoCard): boolean => {
  const { marked } = card;
  
  // Check rows
  for (let i = 0; i < 5; i++) {
    if (marked[i].every(cell => cell)) {
      return true;
    }
  }
  
  // Check columns
  for (let j = 0; j < 5; j++) {
    if (marked.every(row => row[j])) {
      return true;
    }
  }
  
  // Check diagonals
  if (marked[0][0] && marked[1][1] && marked[2][2] && marked[3][3] && marked[4][4]) {
    return true;
  }
  if (marked[0][4] && marked[1][3] && marked[2][2] && marked[3][1] && marked[4][0]) {
    return true;
  }
  
  return false;
};

export const getPlayerRole = (elo: number): string => {
  if (elo >= 2000) return 'Grandmaster';
  if (elo >= 1800) return 'Master';
  if (elo >= 1600) return 'Diamond III';
  if (elo >= 1400) return 'Platinum I';
  if (elo >= 1200) return 'Gold II';
  if (elo >= 1000) return 'Silver III';
  return 'Bronze V';
};
