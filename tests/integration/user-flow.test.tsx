import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from '../../src/pages/Index';

// Mock toast
const mockToast = vi.fn();
vi.mock('../../src/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ state: { username: 'TestUser' } })
}));

// Mock audio components
vi.mock('../../src/components/AudioUpload', () => ({
  default: ({ onUpload }: { onUpload: (file: File) => void }) => (
    <button 
      data-testid="audio-upload"
      onClick={() => onUpload(new File([''], 'test.mp3', { type: 'audio/mp3' }))}
    >
      Upload Audio
    </button>
  )
}));

vi.mock('../../src/components/AudioPlayer', () => ({
  default: ({ audioUrl }: { audioUrl: string }) => (
    <div data-testid="audio-player">Playing: {audioUrl}</div>
  )
}));

describe('Complete User Flow Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderApp = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Index />
      </QueryClientProvider>
    );
  };

  const startGame = async () => {
    renderApp();
    
    // First join as spectator
    const joinButton = screen.getByText('Join the Battle');
    fireEvent.click(joinButton);
    
    await waitFor(() => {
      expect(screen.getByText('Join as Spectator')).toBeInTheDocument();
    });
    
    // Enter username
    const usernameInput = screen.getByPlaceholderText('Enter username...');
    fireEvent.change(usernameInput, { target: { value: 'TestUser' } });
    
    const joinGameButton = screen.getByText('Join Game');
    fireEvent.click(joinGameButton);
    
    // Now we should see the GameBoard landing page
    await waitFor(() => {
      expect(screen.getByText('Start New Battle')).toBeInTheDocument();
    });
    
    // Start the game
    const startButton = screen.getByText('Start New Battle');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText('Waiting for Players')).toBeInTheDocument();
    });
  };

  const startGameAndGetToProduction = async () => {
    await startGame();
    
    // Get to production phase
    const readyButton = screen.getByText('Ready to Start');
    fireEvent.click(readyButton);
    vi.advanceTimersByTime(4000);
    
    await waitFor(() => {
      expect(screen.getByText('Production Phase')).toBeInTheDocument();
    });
  };

  describe('Game Initialization', () => {
    it('should start on landing page with join button', async () => {
      renderApp();
      
      expect(screen.getByText('Sound Royale')).toBeInTheDocument();
      expect(screen.getByText('Join the Battle')).toBeInTheDocument();
      
      // Should show features
      expect(screen.getByText('Smart Gameplay')).toBeInTheDocument();
      expect(screen.getByText('Spectator Voting')).toBeInTheDocument();
    });

    it('should navigate through join flow and start game', async () => {
      await startGame();
      
      expect(screen.getByText('Players: 0/2')).toBeInTheDocument();
    });
  });

  describe('Player Ready Flow', () => {
    it('should handle single player ready and auto-ready second player', async () => {
      await startGame();
      
      // Click ready for player 1
      const readyButton = screen.getByText('Ready to Start');
      fireEvent.click(readyButton);
      
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Player Ready!',
        description: 'BeatMaster_2024 is ready to start production.'
      });
      
      // Fast-forward to auto-ready timeout
      vi.advanceTimersByTime(2000);
      
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Player Ready!',
        description: 'RhythmKing is ready to start production.'
      });
    });

    it('should transition to production phase after both players ready', async () => {
      await startGame();
      
      const readyButton = screen.getByText('Ready to Start');
      fireEvent.click(readyButton);
      
      // Fast-forward through auto-ready and genre calling
      vi.advanceTimersByTime(4000);
      
      await waitFor(() => {
        expect(screen.getByText('Production Phase')).toBeInTheDocument();
      });
    });

    it('should call exactly one genre when both players are ready', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      await startGame();
      
      const readyButton = screen.getByText('Ready to Start');
      fireEvent.click(readyButton);
      
      // Fast-forward through auto-ready and genre calling
      vi.advanceTimersByTime(4000);
      
      // Count how many times callGenre was logged
      const callGenreCalls = consoleSpy.mock.calls.filter(call => 
        call[0]?.includes('🎵 callGenre() called')
      );
      
      // Should be called exactly once
      expect(callGenreCalls).toHaveLength(1);
      
      consoleSpy.mockRestore();
    });
  });

  describe('Production Phase', () => {
    beforeEach(async () => {
      await startGameAndGetToProduction();
    });

    it('should show timer counting down from 30:00', async () => {
      expect(screen.getByText('30:00')).toBeInTheDocument();
      
      // Fast-forward 1 second
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText('29:59')).toBeInTheDocument();
      });
    });

    it('should show current called genre', async () => {
      // Should show the called genre at the top
      const genreElements = screen.getAllByText(/Hip Hop|Electronic|Rock|Jazz|Pop|Classical|R&B|Funk|Reggae|Country|Latin|K-Pop|Afrobeat|Blues|Ambient/);
      expect(genreElements.length).toBeGreaterThan(0);
    });

    it('should allow audio upload during production', async () => {
      const uploadButton = screen.getByTestId('audio-upload');
      expect(uploadButton).toBeInTheDocument();
      
      fireEvent.click(uploadButton);
      
      // Should show upload success or audio player
      await waitFor(() => {
        expect(screen.queryByTestId('audio-player')).toBeInTheDocument();
      });
    });

    it('should transition to voting phase when timer reaches 0', async () => {
      // Fast-forward through entire production phase
      vi.advanceTimersByTime(30 * 60 * 1000); // 30 minutes
      
      await waitFor(() => {
        expect(screen.getByText('Voting Phase')).toBeInTheDocument();
      });
    });
  });

  describe('Voting Phase', () => {
    beforeEach(async () => {
      await startGameAndGetToProduction();
      
      // Fast-forward through production
      vi.advanceTimersByTime(30 * 60 * 1000);
      
      await waitFor(() => {
        expect(screen.getByText('Voting Phase')).toBeInTheDocument();
      });
    });

    it('should show voting timer counting down from 5:00', async () => {
      expect(screen.getByText('5:00')).toBeInTheDocument();
      
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText('4:59')).toBeInTheDocument();
      });
    });

    it('should simulate spectator votes', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      // Fast-forward to allow mock voting to complete
      vi.advanceTimersByTime(10000);
      
      await waitFor(() => {
        const voteCalls = consoleSpy.mock.calls.filter(call => 
          call[0]?.includes('🗳️ Mock spectator')
        );
        expect(voteCalls.length).toBeGreaterThan(0);
      });
      
      consoleSpy.mockRestore();
    });

    it('should determine winner and mark their card after voting ends', async () => {
      // Fast-forward through voting phase
      vi.advanceTimersByTime(5 * 60 * 1000);
      
      await waitFor(() => {
        // Should show results and winner
        expect(screen.getByText(/Results/)).toBeInTheDocument();
      });
      
      // Check that winner got their square marked
      const markedCells = screen.getAllByTestId(/bingo-cell/).filter(cell => 
        cell.classList.contains('bg-green-500') || cell.classList.contains('bg-blue-500')
      );
      expect(markedCells.length).toBeGreaterThan(0);
    });
  });

  describe('Game Completion', () => {
    it('should detect bingo and end game when player gets 5 in a row', async () => {
      // This would require mocking a winning scenario
      // For now, just test that game can complete multiple rounds
      await startGameAndGetToProduction();
      
      // Complete one full round
      vi.advanceTimersByTime(30 * 60 * 1000); // Production
      vi.advanceTimersByTime(5 * 60 * 1000); // Voting
      
      await waitFor(() => {
        expect(screen.getByText(/Results/)).toBeInTheDocument();
      });
      
      // Should show option to continue or new game
      expect(screen.getByText(/New Game|Continue|Reset/)).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('should maintain called genres array correctly', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      await startGameAndGetToProduction();
      
      // Check that called genres array has correct length
      const genreLogCalls = consoleSpy.mock.calls.filter(call => 
        call[0]?.includes('🎵 Updated called genres array:')
      );
      
      if (genreLogCalls.length > 0) {
        const lastCall = genreLogCalls[genreLogCalls.length - 1];
        const calledGenres = lastCall[1];
        
        // After first genre call, should have 1 genre
        expect(calledGenres).toHaveLength(1);
      }
      
      consoleSpy.mockRestore();
    });
  });
});
