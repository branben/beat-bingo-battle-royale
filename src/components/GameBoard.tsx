import React, { useState, useEffect } from 'react';
import { GameState, Player } from '@/types/game';
import { generateBingoCard, selectGenre, checkBingo } from '@/utils/gameLogic';
import BingoCard from './BingoCard';
import VotingPanel from './VotingPanel';
import PlayerStats from './PlayerStats';
import { GameAnalytics } from './GameAnalytics';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Play, Users, CheckCircle, Clock, Timer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GameBoardProps {
  currentPlayer?: Player;
  onGameEnd?: (winner: Player) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ currentPlayer, onGameEnd }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [blindedPlayers, setBlindedPlayers] = useState<Set<string>>(new Set());
  const [playersReady, setPlayersReady] = useState<Set<string>>(new Set());
  const [mockVotingActive, setMockVotingActive] = useState(false);
  const [gameAnalytics, setGameAnalytics] = useState({
    startTime: Date.now(),
    totalVotes: 0,
    roundDetails: [] as Array<{
      round: number;
      genre: string;
      winner: string;
      votingMargin: number;
      timeTaken: number;
    }>
  });
  const { toast } = useToast();

  // Helper function to format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Mock data for demonstration
  const mockPlayers: Player[] = [
    {
      id: '1',
      username: 'BeatMaster_2024',
      competitor_elo: 1250,
      spectator_elo: 1100,
      wins: 15,
      losses: 8,
      correct_votes: 45,
      coins: 250,
      role: 'Silver III'
    },
    {
      id: '2', 
      username: 'RhythmKing',
      competitor_elo: 1180,
      spectator_elo: 950,
      wins: 12,
      losses: 10,
      correct_votes: 38,
      coins: 180,
      role: 'Silver III'
    }
  ];

  const mockSpectators: Player[] = [
    {
      id: '3',
      username: 'SpectatorOne',
      competitor_elo: 800,
      spectator_elo: 1200,
      wins: 5,
      losses: 3,
      correct_votes: 25,
      coins: 120,
      role: 'Silver III'
    },
    {
      id: '4',
      username: 'VoteExpert',
      competitor_elo: 950,
      spectator_elo: 1400,
      wins: 8,
      losses: 6,
      correct_votes: 32,
      coins: 200,
      role: 'Silver III'
    },
    {
      id: '5',
      username: 'MusicLover',
      competitor_elo: 750,
      spectator_elo: 1050,
      wins: 3,
      losses: 4,
      correct_votes: 18,
      coins: 90,
      role: 'Bronze V'
    }
  ];

  const startNewGame = () => {
    const player1 = mockPlayers[0];
    const player2 = mockPlayers[1];
    const player1Card = generateBingoCard();
    const player2Card = generateBingoCard();
    
    const newGame: GameState = {
      id: `game_${Date.now()}`,
      player1,
      player2,
      player1_card: player1Card,
      player2_card: player2Card,
      called_genres: [],
      current_call: undefined,
      spectators: mockSpectators,
      votes: {},
      voting_deadline: undefined,
      handicaps_used: [],
      winner_id: undefined,
      status: 'waiting',
      
      // Additional required properties for compatibility
      currentRound: 0,
      currentGenre: undefined,
      players: [player1, player2],
      player1Card,
      player2Card,
      calledGenres: [],
      roundStartTime: undefined,
      winner: undefined,
      spectatorCount: mockSpectators.length,
      totalRounds: 0,
      matchNumber: Math.floor(Math.random() * 9000) + 1000
    };

    setGameState(newGame);
    setPlayersReady(new Set());
    setGameAnalytics({
      startTime: Date.now(),
      totalVotes: 0,
      roundDetails: []
    });
    toast({
      title: "Game Started!",
      description: "Both players must agree to call the first genre.",
    });
  };

  const handlePlayerReady = (playerId: string) => {
    if (!gameState || gameState.status !== 'waiting') return;

    const newReadyPlayers = new Set(playersReady);
    
    if (newReadyPlayers.has(playerId)) {
      newReadyPlayers.delete(playerId);
      toast({
        title: "Player Not Ready",
        description: `${playerId === '1' ? 'BeatMaster_2024' : 'RhythmKing'} is no longer ready.`,
      });
    } else {
      newReadyPlayers.add(playerId);
      toast({
        title: "Player Ready!",
        description: `${playerId === '1' ? 'BeatMaster_2024' : 'RhythmKing'} is ready to start production.`,
      });
      
      // Auto-ready the other player after a short delay for demo purposes
      if (newReadyPlayers.size === 1) {
        const otherPlayerId = playerId === '1' ? '2' : '1';
        console.log('🔄 Auto-readying other player:', otherPlayerId);
        setTimeout(() => {
          setPlayersReady(new Set([playerId, otherPlayerId]));
          toast({
            title: "Player Ready!",
            description: `${otherPlayerId === '1' ? 'BeatMaster_2024' : 'RhythmKing'} is ready to start production.`,
          });
          console.log('🔄 Scheduling callGenre from auto-ready');
          setTimeout(() => callGenre(), 1000);
        }, 2000);
        return; // Exit early to prevent main check from running
      }
    }
    
    setPlayersReady(newReadyPlayers);
    
    // If both players are ready, automatically call the genre
    // Note: This won't trigger when auto-ready happens because of the early return above
    if (newReadyPlayers.size === 2 && gameState) {
      console.log('🔄 Both players ready, scheduling callGenre from main check');
      setTimeout(() => callGenre(), 1000); // Small delay for better UX
    }
  };

  const callGenre = () => {
    if (!gameState) return;

    console.log('🎵 callGenre() called - Current called genres:', gameState.called_genres);
    console.log('🎵 Current game status:', gameState.status);

    const newGenre = selectGenre(
      gameState.player1_card.squares.flat(),
      gameState.player2_card.squares.flat(),
      gameState.called_genres
    );

    console.log('🎵 New genre selected:', newGenre);

    setGameState(prev => {
      if (!prev) return null;
      const updatedState = {
        ...prev,
        called_genres: [...prev.called_genres, newGenre],
        calledGenres: [...prev.calledGenres, newGenre],
        current_call: newGenre,
        currentGenre: newGenre,
        status: 'active' as const,
        voting_deadline: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes for production
      };
      console.log('🎵 Updated called genres array:', updatedState.called_genres);
      return updatedState;
    });

    setTimeRemaining(1800); // 30 minutes in seconds
    setPlayersReady(new Set()); // Reset ready states
    
    toast({
      title: "🎵 Genre Called!",
      description: `Both players have 30 minutes to create a ${newGenre} beat!`,
    });
  };

  const handleSquareClick = (playerId: string, row: number, col: number) => {
    if (!gameState || gameState.status !== 'active') return;

    setGameState(prev => {
      if (!prev) return null;

      const isPlayer1 = playerId === prev.player1.id;
      const card = isPlayer1 ? prev.player1_card : prev.player2_card;
      const currentCall = prev.current_call;

      if (!currentCall || card.squares[row][col] !== currentCall) return prev;

      const newCard = {
        ...card,
        marked: card.marked.map((cardRow, rIndex) =>
          cardRow.map((marked, cIndex) =>
            rIndex === row && cIndex === col ? true : marked
          )
        )
      };

      const hasBingo = checkBingo(newCard);
      
      if (hasBingo) {
        const winner = isPlayer1 ? prev.player1 : prev.player2;
        onGameEnd?.(winner);
        return {
          ...prev,
          [isPlayer1 ? 'player1_card' : 'player2_card']: newCard,
          [isPlayer1 ? 'player1Card' : 'player2Card']: newCard,
          winner_id: winner.id,
          winner: winner.id,
          status: 'finished'
        };
      }

      return {
        ...prev,
        [isPlayer1 ? 'player1_card' : 'player2_card']: newCard,
        [isPlayer1 ? 'player1Card' : 'player2Card']: newCard
      };
    });
  };

  const startMockVoting = () => {
    if (!gameState || gameState.status !== 'voting' || mockVotingActive) return;
    
    setMockVotingActive(true);
    console.log('🤖 Starting mock spectator voting...');
    
    // Simulate 3-5 spectator votes over 10-15 seconds
    const numVotes = Math.floor(Math.random() * 3) + 3; // 3-5 votes
    
    for (let i = 0; i < numVotes; i++) {
      setTimeout(() => {
        if (gameState && gameState.status === 'voting') {
          const spectatorId = `spectator_${i + 1}`;
          const randomPlayer = Math.random() > 0.5 ? gameState.player1.id : gameState.player2.id;
          
          setGameState(prev => prev ? {
            ...prev,
            votes: {
              ...prev.votes,
              [spectatorId]: randomPlayer
            }
          } : null);
          
          const playerName = randomPlayer === gameState.player1.id ? gameState.player1.username : gameState.player2.username;
          console.log(`🗳️ Mock spectator ${spectatorId} voted for ${playerName}`);
        }
      }, (i + 1) * (Math.random() * 3000 + 2000)); // Random delay between 2-5 seconds
    }
    
    // Reset mock voting state after all votes
    setTimeout(() => setMockVotingActive(false), numVotes * 5000 + 2000);
  };

  const handleVote = (playerId: string) => {
    if (!gameState || !currentPlayer) return;

    setGameState(prev => prev ? {
      ...prev,
      votes: {
        ...prev.votes,
        [currentPlayer.id]: playerId
      }
    } : null);
  };

  useEffect(() => {
    if ((gameState?.status === 'voting' || gameState?.status === 'active') && timeRemaining >= 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (gameState?.status === 'voting') {
              // Voting ended, determine winner
              const totalVotes = Object.keys(gameState.votes).length;
              console.log('🗳️ Voting ended. Total votes:', totalVotes);
              
              // For demo purposes, proceed even with fewer than 3 votes
              if (totalVotes > 0) {
                // Process votes and determine winner
                const votes = gameState.votes;
                const player1Votes = Object.values(votes).filter(v => v === gameState.player1.id).length;
                const player2Votes = Object.values(votes).filter(v => v === gameState.player2.id).length;
                
                console.log('🗳️ Vote tally:', { player1Votes, player2Votes });
                
                // Determine winner and mark their square
                const winner = player1Votes > player2Votes ? gameState.player1 : gameState.player2;
                const winnerCard = player1Votes > player2Votes ? 'player1_card' : 'player2_card';
                const winnerCardCamel = player1Votes > player2Votes ? 'player1Card' : 'player2Card';
                const winnerVotePercent = (player1Votes > player2Votes ? player1Votes : player2Votes) / totalVotes * 100;
                
                // Update analytics
                setGameAnalytics(prev => ({
                  ...prev,
                  totalVotes: prev.totalVotes + totalVotes,
                  roundDetails: [...prev.roundDetails, {
                    round: gameState.called_genres.length,
                    genre: gameState.current_call!,
                    winner: winner.username,
                    votingMargin: winnerVotePercent,
                    timeTaken: 300 - timeRemaining + 300 // Production time + voting time
                  }]
                }));
                
                // Find the position of the current genre on winner's card and mark it
                const updatedCard = { ...gameState[winnerCard] };
                const currentGenre = gameState.current_call;
                
                // Find and mark the genre square
                for (let i = 0; i < 5; i++) {
                  for (let j = 0; j < 5; j++) {
                    if (updatedCard.squares[i][j] === currentGenre) {
                      updatedCard.marked[i][j] = true;
                      console.log(`🎯 Marked ${currentGenre} at position [${i},${j}] for ${winner.username}`);
                      break;
                    }
                  }
                }
                
                // Check for bingo
                const hasBingo = checkBingo(updatedCard);
                
                if (hasBingo) {
                  setGameState(current => current ? { 
                    ...current, 
                    status: 'finished',
                    [winnerCard]: updatedCard,
                    [winnerCardCamel]: updatedCard,
                    winner_id: winner.id,
                    winner: winner.id
                  } : null);
                  toast({
                    title: "🎉 BINGO!",
                    description: `${winner.username} wins the match!`,
                  });
                } else {
                  // Continue game - call next genre
                  setGameState(current => current ? { 
                    ...current, 
                    status: 'waiting',
                    [winnerCard]: updatedCard,
                    [winnerCardCamel]: updatedCard,
                    current_call: null,
                    currentGenre: undefined,
                    votes: {}
                  } : null);
                  toast({
                    title: `🏆 ${winner.username} wins this round!`,
                    description: "Get ready for the next genre call.",
                  });
                  // Auto-ready players for next round
                  setTimeout(() => {
                    setPlayersReady(new Set(['1', '2']));
                    setTimeout(() => callGenre(), 1000);
                  }, 2000);
                }
              } else {
                // No votes, continue without marking
                toast({
                  title: "⏰ No Votes",
                  description: "Round ends with no votes. Starting next round.",
                });
                setGameState(current => current ? { 
                  ...current, 
                  status: 'waiting',
                  current_call: null,
                  currentGenre: undefined,
                  votes: {}
                } : null);
                setTimeout(() => {
                  setPlayersReady(new Set(['1', '2']));
                  setTimeout(() => callGenre(), 1000);
                }, 2000);
              }
            } else if (gameState?.status === 'active') {
              // Production time ended, move to voting
              setGameState(current => current ? { 
                ...current, 
                status: 'voting',
                voting_deadline: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes for voting
              } : null);
              setTimeRemaining(300); // 5 minutes in seconds
              toast({
                title: "⏰ Time's Up!",
                description: "Production phase complete. Voting begins now!",
              });
              
              // Start mock voting after a short delay
              setTimeout(() => startMockVoting(), 2000);
              
              return 300;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState?.status, timeRemaining, toast]);

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
              Sound Royale
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Compete in real-time bingo battles with music genres. Vote, strategize, and climb the leaderboard!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {mockPlayers.map((player) => (
              <PlayerStats key={player.id} player={player} />
            ))}
          </div>

          <Button
            onClick={startNewGame}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-4 text-lg"
          >
            <Play className="mr-2" size={20} />
            Start New Battle
          </Button>

          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Users size={16} />
            <span>{mockSpectators.length} spectators ready</span>
          </div>
        </div>
      </div>
    );
  }

  const isCurrentPlayerCompeting = currentPlayer && (currentPlayer.id === gameState.player1.id || currentPlayer.id === gameState.player2.id);
  const currentPlayerReady = currentPlayer ? playersReady.has(currentPlayer.id) : false;

  // Convert votes to array format for VotingPanel
  const votesArray = Object.entries(gameState.votes).map(([voterId, playerId]) => ({
    id: voterId,
    playerId,
    voterName: mockSpectators.find(s => s.id === voterId)?.username || 'Unknown',
    power: mockSpectators.find(s => s.id === voterId)?.spectator_elo / 1000 || 1
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Sound Royale
          </h1>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant="outline" className="border-purple-500 text-purple-300">
              Game #{gameState.id.slice(-4)}
            </Badge>
            <Badge variant="outline" className="border-cyan-500 text-cyan-300">
              {gameState.called_genres.length} Genres Called
            </Badge>
            <Badge variant="outline" className="border-green-500 text-green-300">
              {gameState.spectators.length} Spectators
            </Badge>
          </div>
        </div>

        {/* Waiting for Players to Ready Up */}
        {gameState.status === 'waiting' && (
          <div className="text-center p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <Clock className="text-yellow-400" />
              Waiting for Players to Ready Up
            </h2>
            <p className="text-lg text-slate-300 mb-6">
              Both competitors must agree before the first genre is called
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Player 1 Ready Status */}
              <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-white">{gameState.player1.username}</span>
                  {playersReady.has(gameState.player1.id) ? (
                    <CheckCircle className="text-green-400" size={20} />
                  ) : (
                    <Clock className="text-yellow-400" size={20} />
                  )}
                </div>
                {/* Always show ready button for demo purposes */}
                <Button
                  onClick={() => handlePlayerReady(gameState.player1.id)}
                  variant={playersReady.has(gameState.player1.id) ? "secondary" : "default"}
                  className={playersReady.has(gameState.player1.id) ? "bg-green-600 hover:bg-green-700" : ""}
                  disabled={playersReady.has(gameState.player1.id)}
                >
                  {playersReady.has(gameState.player1.id) ? "Ready!" : "Mark Ready"}
                </Button>
              </div>

              {/* Player 2 Ready Status */}
              <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-white">{gameState.player2.username}</span>
                  {playersReady.has(gameState.player2.id) ? (
                    <CheckCircle className="text-green-400" size={20} />
                  ) : (
                    <Clock className="text-yellow-400" size={20} />
                  )}
                </div>
                {/* Always show ready button for demo purposes */}
                <Button
                  onClick={() => handlePlayerReady(gameState.player2.id)}
                  variant={playersReady.has(gameState.player2.id) ? "secondary" : "default"}
                  className={playersReady.has(gameState.player2.id) ? "bg-green-600 hover:bg-green-700" : ""}
                  disabled={playersReady.has(gameState.player2.id)}
                >
                  {playersReady.has(gameState.player2.id) ? "Ready!" : "Mark Ready"}
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-slate-400">
                {playersReady.size}/2 players ready • Once both are ready, the first genre will be called automatically
              </p>
            </div>
          </div>
        )}

        {/* Current Genre Display */}
        {gameState.current_call && gameState.status === 'active' && (
          <div className="text-center p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg">
            <p className="text-lg text-slate-300">Current Genre:</p>
            <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
              <Sparkles className="text-yellow-400" />
              {gameState.current_call}
              <Sparkles className="text-yellow-400" />
            </h2>
            <div className="flex items-center justify-center gap-4 mt-2 text-slate-300">
              <p className="text-sm text-slate-400">
                Production Phase: Create your beat
              </p>
              <div className="flex items-center gap-2">
                <Timer size={18} />
                <span className={timeRemaining <= 60 ? "text-red-400 font-bold" : "text-white font-semibold"}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              {/* Development Skip Button */}
              {process.env.NODE_ENV === 'development' && (
                <Button
                  onClick={() => {
                    setGameState(current => current ? { 
                      ...current, 
                      status: 'voting',
                      voting_deadline: new Date(Date.now() + 5 * 60 * 1000)
                    } : null);
                    setTimeRemaining(300);
                    setTimeout(() => startMockVoting(), 1000);
                    toast({
                      title: "⏩ Skipped to Voting",
                      description: "Development skip activated",
                    });
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
                >
                  Skip to Voting
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Voting Panel */}
        {gameState.status === 'voting' && (
          <div className="space-y-4">
            <VotingPanel
              players={gameState.players}
              currentGenre={gameState.current_call || ''}
              timeRemaining={timeRemaining}
              votes={votesArray}
              onVote={handleVote}
              currentPlayer={currentPlayer}
            />
            
            {/* Development Skip Button for Voting */}
            {process.env.NODE_ENV === 'development' && (
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => {
                    // Force voting to end with current votes
                    setTimeRemaining(0);
                    toast({
                      title: "⏩ Skipped Voting Timer",
                      description: "Development skip activated",
                    });
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs border-red-500 text-red-400 hover:bg-red-500/10"
                >
                  Skip Voting Timer
                </Button>
                
                <Button
                  onClick={() => {
                    if (!mockVotingActive) {
                      startMockVoting();
                      toast({
                        title: "🤖 Mock Voting Started",
                        description: "Simulating spectator votes",
                      });
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs border-blue-500 text-blue-400 hover:bg-blue-500/10"
                  disabled={mockVotingActive}
                >
                  {mockVotingActive ? 'Voting...' : 'Start Mock Voting'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Game End Screen */}
        {gameState.status === 'finished' && gameState.winner_id && (
          <div className="text-center p-8 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg">
            <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              🎉 GAME OVER! 🎉
            </h2>
            <h3 className="text-2xl font-semibold text-green-400 mb-6">
              {gameState.winner_id === gameState.player1.id ? gameState.player1.username : gameState.player2.username} WINS!
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-6">
              <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Final Stats</h4>
                <p className="text-slate-300">Winner: {gameState.winner_id === gameState.player1.id ? gameState.player1.username : gameState.player2.username}</p>
                <p className="text-slate-300">ELO: {gameState.winner_id === gameState.player1.id ? gameState.player1.competitor_elo : gameState.player2.competitor_elo}</p>
                <p className="text-slate-300">Rank: {gameState.winner_id === gameState.player1.id ? gameState.player1.role : gameState.player2.role}</p>
              </div>
              <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Match Summary</h4>
                <p className="text-slate-300">Genres Called: {gameState.called_genres.length}</p>
                <p className="text-slate-300">Total Votes: {Object.keys(gameState.votes).length}</p>
                <p className="text-slate-300">Spectators: {gameState.spectators.length}</p>
              </div>
            </div>
            
            {/* Development Reset Button */}
            {process.env.NODE_ENV === 'development' && (
              <Button
                onClick={() => {
                  setGameState(null);
                  setPlayersReady(new Set());
                  setTimeRemaining(300);
                  setMockVotingActive(false);
                  toast({
                    title: "🔄 Game Reset",
                    description: "Starting a new game",
                  });
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Start New Game
              </Button>
            )}
          </div>
        )}

        {/* Game Boards */}
        {gameState.status !== 'waiting' && gameState.status !== 'finished' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <BingoCard
              card={gameState.player1_card}
              calledGenres={gameState.called_genres}
              isBlinded={blindedPlayers.has(gameState.player1.id)}
              playerName={gameState.player1.username}
            />
            <BingoCard
              card={gameState.player2_card}
              calledGenres={gameState.called_genres}
              isBlinded={blindedPlayers.has(gameState.player2.id)}
              playerName={gameState.player2.username}
            />
          </div>
        )}

        {/* Player Stats */}
        {gameState.status !== 'waiting' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PlayerStats player={gameState.player1} />
            <PlayerStats player={gameState.player2} />
          </div>
        )}

        {/* Game Controls */}
        <div className="text-center">
          {gameState.status === 'finished' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-yellow-400">
                🎉 {gameState.winner_id === gameState.player1.id ? gameState.player1.username : gameState.player2.username} Wins! 🎉
              </h2>
              
              {/* Game Analytics */}
              <GameAnalytics 
                gameState={gameState}
                gameDuration={Math.floor((Date.now() - gameAnalytics.startTime) / 1000)}
                totalVotes={gameAnalytics.totalVotes}
                roundDetails={gameAnalytics.roundDetails}
              />
              
              <Button
                onClick={startNewGame}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Start New Battle
              </Button>
            </div>
          )}
        </div>

        {/* Called Genres History */}
        {gameState.called_genres.length > 0 && (
          <div className="bg-slate-800/50 border border-purple-500/20 rounded-lg p-4">
            <h3 className="text-lg font-bold text-cyan-400 mb-3">Called Genres</h3>
            <div className="flex flex-wrap gap-2">
              {gameState.called_genres.map((genre, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-slate-700 text-slate-200"
                >
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
