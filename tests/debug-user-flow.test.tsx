import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from '../src/pages/Index';

// Mock toast
const mockToast = vi.fn();
vi.mock('../src/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ state: { username: 'TestUser' } })
}));

describe('Debug User Flow', () => {
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

  it('should click join button and see spectator form', async () => {
    renderApp();
    
    expect(screen.getByText('Join the Battle')).toBeInTheDocument();
    
    // First join as spectator
    const joinButton = screen.getByText('Join the Battle');
    console.log('About to click join button');
    fireEvent.click(joinButton);
    console.log('Clicked join button');
    
    // Give some time and check what happened
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('After click - screen content:', screen.debug());
    
    // Try to find the spectator form text
    try {
      screen.getByText('Join as Spectator');
      console.log('✅ Join form appeared immediately');
    } catch (e) {
      console.log('❌ Join form not found immediately');
    }
  }, 10000);

  it('should complete username entry and join game', async () => {
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
    }, { timeout: 10000 });
    
    console.log('✅ GameBoard landing page appeared');
  });

  it('should start the game and see waiting for players', async () => {
    renderApp();
    
    // Complete join flow
    const joinButton = screen.getByText('Join the Battle');
    fireEvent.click(joinButton);
    
    await waitFor(() => {
      expect(screen.getByText('Join as Spectator')).toBeInTheDocument();
    });
    
    const usernameInput = screen.getByPlaceholderText('Enter username...');
    fireEvent.change(usernameInput, { target: { value: 'TestUser' } });
    
    const joinGameButton = screen.getByText('Join Game');
    fireEvent.click(joinGameButton);
    
    await waitFor(() => {
      expect(screen.getByText('Start New Battle')).toBeInTheDocument();
    });
    
    // Start the game
    const startButton = screen.getByText('Start New Battle');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(screen.getByText('Waiting for Players')).toBeInTheDocument();
    }, { timeout: 10000 });
    
    console.log('✅ Game started and waiting for players');
    expect(screen.getByText('Players: 0/2')).toBeInTheDocument();
  });
});
