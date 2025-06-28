
import React, { useState, useEffect } from 'react';
import { GameState, Player } from '@/types/game';
import { generateBingoCard, selectGenre, checkBingo } from '@/utils/gameLogic';
import BingoCard from './BingoCard';
import VotingPanel from './VotingPanel';
import PlayerStats from './PlayerStats';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Play, Users, CheckCircle, Clock } from 'lucide-react';
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
  const { toast } = useToast();

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
    
    const newGame: GameState = {
      id: `game_${Date.now()}`,
      player1,
      player2,
      player1_card: generateBingoCard(),
      player2_card: generateBingoCard(),
      called_genres: [],
      spectators: mockSpectators,
      votes: {},
      handicaps_used: [],
      status: 'waiting'
    };

    setGameState(newGame);
    setPlayersReady(new Set());
    toast({
      title: "Game Started!",
      description: "Both players must agree to call the first genre.",
    });
  };

  const handlePlayerReady = (playerId: string) => {
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
    }
    
    setPlayersReady(newReadyPlayers);
    
    // If both players are ready, automatically call the genre
    if (newReadyPlayers.size === 2 && gameState) {
      setTimeout(() => callGenre(), 1000); // Small delay for better UX
    }
  };

  const callGenre = () => {
    if (!gameState) return;

    const newGenre = selectGenre(
      gameState.called_genres,
      gameState.player1_card,
      gameState.player2_card
    );

    setGameState(prev => prev ? {
      ...prev,
      called_genres: [...prev.called_genres, newGenre],
      current_call: newGenre,
      status: 'active',
      voting_deadline: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes for production
    } : null);

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
          winner_id: winner.id,
          status: 'finished'
        };
      }

      return {
        ...prev,
        [isPlayer1 ? 'player1_card' : 'player2_card']: newCard
      };
    });
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
    if (gameState?.status === 'voting' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Voting ended, determine winner
            const totalVotes = Object.keys(gameState.votes).length;
            if (totalVotes >= 3) { // Minimum spectators
              // Process votes and continue game
              setGameState(current => current ? { ...current, status: 'active' } : null);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState?.status, timeRemaining]);

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
                {isCurrentPlayerCompeting && currentPlayer?.id === gameState.player1.id && (
                  <Button
                    onClick={() => handlePlayerReady(gameState.player1.id)}
                    variant={currentPlayerReady ? "secondary" : "default"}
                    className={currentPlayerReady ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {currentPlayerReady ? "Ready!" : "Mark Ready"}
                  </Button>
                )}
                {!isCurrentPlayerCompeting && (
                  <Badge variant={playersReady.has(gameState.player1.id) ? "default" : "outline"}>
                    {playersReady.has(gameState.player1.id) ? "Ready" : "Waiting"}
                  </Badge>
                )}
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
                {isCurrentPlayerCompeting && currentPlayer?.id === gameState.player2.id && (
                  <Button
                    onClick={() => handlePlayerReady(gameState.player2.id)}
                    variant={currentPlayerReady ? "secondary" : "default"}
                    className={currentPlayerReady ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {currentPlayerReady ? "Ready!" : "Mark Ready"}
                  </Button>
                )}
                {!isCurrentPlayerCompeting && (
                  <Badge variant={playersReady.has(gameState.player2.id) ? "default" : "outline"}>
                    {playersReady.has(gameState.player2.id) ? "Ready" : "Waiting"}
                  </Badge>
                )}
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
            <p className="text-sm text-slate-400 mt-2">
              Production Phase: 30 minutes to create your beat
            </p>
          </div>
        )}

        {/* Voting Panel */}
        {gameState.status === 'voting' && (
          <VotingPanel
            player1={gameState.player1}
            player2={gameState.player2}
            spectators={gameState.spectators}
            votes={gameState.votes}
            onVote={handleVote}
            currentSpectator={currentPlayer}
            timeRemaining={timeRemaining}
            currentGenre={gameState.current_call || ''}
          />
        )}

        {/* Game Boards */}
        {gameState.status !== 'waiting' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <BingoCard
              card={gameState.player1_card}
              onSquareClick={(row, col) => handleSquareClick(gameState.player1.id, row, col)}
              isClickable={gameState.status === 'active'}
              playerName={gameState.player1.username}
              isBlinded={blindedPlayers.has(gameState.player1.id)}
            />
            <BingoCard
              card={gameState.player2_card}
              onSquareClick={(row, col) => handleSquareClick(gameState.player2.id, row, col)}
              isClickable={gameState.status === 'active'}
              playerName={gameState.player2.username}
              isBlinded={blindedPlayers.has(gameState.player2.id)}
            />
          </div>
        )}

        {/* Player Stats */}
        {gameState.status !== 'waiting' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PlayerStats player={gameState.player1} isCompact />
            <PlayerStats player={gameState.player2} isCompact />
          </div>
        )}

        {/* Game Controls */}
        <div className="text-center">
          {gameState.status === 'finished' && (
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-yellow-400">
                🎉 {gameState.winner_id === gameState.player1.id ? gameState.player1.username : gameState.player2.username} Wins! 🎉
              </h2>
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
