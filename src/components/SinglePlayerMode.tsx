
import React, { useState, useEffect } from 'react';
import { GameState, Player } from '@/types/game';
import { generateBingoCard, selectGenre, checkBingo } from '@/utils/gameLogic';
import BingoCard from './BingoCard';
import VotingPanel from './VotingPanel';
import PlayerStats from './PlayerStats';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Play, Users, CheckCircle, Clock, Timer, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SinglePlayerModeProps {
  currentPlayer: Player;
  onGameEnd?: (winner: Player) => void;
}

const SinglePlayerMode: React.FC<SinglePlayerModeProps> = ({ currentPlayer, onGameEnd }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [gameStarted, setGameStarted] = useState(false);
  const { toast } = useToast();

  // Create AI opponent
  const aiOpponent: Player = {
    id: 'ai-opponent',
    username: 'RhythmBot',
    competitor_elo: 1000,
    spectator_elo: 1200,
    wins: 50,
    losses: 45,
    correct_votes: 120,
    coins: 500,
    role: 'Silver III'
  };

  // Mock spectators for voting
  const mockSpectators: Player[] = [
    {
      id: 'spectator-1',
      username: 'MusicFan',
      competitor_elo: 800,
      spectator_elo: 1100,
      wins: 10,
      losses: 5,
      correct_votes: 30,
      coins: 150,
      role: 'Silver III'
    },
    {
      id: 'spectator-2',
      username: 'BeatJudge',
      competitor_elo: 950,
      spectator_elo: 1300,
      wins: 15,
      losses: 8,
      correct_votes: 45,
      coins: 200,
      role: 'Gold II'
    },
    {
      id: 'spectator-3',
      username: 'ProducerPro',
      competitor_elo: 1200,
      spectator_elo: 1500,
      wins: 25,
      losses: 10,
      correct_votes: 80,
      coins: 350,
      role: 'Gold II'
    }
  ];

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startGame = () => {
    const player1Card = generateBingoCard();
    const player2Card = generateBingoCard();

    const newGameState: GameState = {
      id: `sp-${Date.now()}`,
      status: 'active',
      currentRound: 0,
      called_genres: [],
      currentGenre: undefined,
      player1: currentPlayer,
      player2: aiOpponent,
      players: [currentPlayer, aiOpponent],
      spectators: mockSpectators,
      player1_card: player1Card,
      player2_card: player2Card,
      player1Card,
      player2Card,
      calledGenres: [],
      roundStartTime: Date.now(),
      voting_deadline: undefined,
      winner_id: undefined,
      spectatorCount: mockSpectators.length,
      totalRounds: 0,
      matchNumber: Math.floor(Math.random() * 9000) + 1000,
      votes: {},
      handicaps_used: [],
      current_call: undefined,
      winner: undefined
    };

    setGameState(newGameState);
    setGameStarted(true);
    
    toast({
      title: "🎮 Single Player Game Started!",
      description: "Compete against RhythmBot. First genre will be called in 3 seconds!",
    });

    // Start first round
    setTimeout(() => callNextGenre(newGameState), 3000);
  };

  const callNextGenre = (currentGameState: GameState) => {
    const player1_genres = currentGameState.player1Card?.squares?.flat() || [];
    const player2_genres = currentGameState.player2Card?.squares?.flat() || [];
    const genre = selectGenre(player1_genres, player2_genres, currentGameState.called_genres);

    if (!genre) {
      handleGameEnd(currentGameState);
      return;
    }

    const newRound = currentGameState.currentRound + 1;
    const votingDeadline = Date.now() + 5 * 60 * 1000; // 5 minutes

    const updatedGameState: GameState = {
      ...currentGameState,
      status: 'voting',
      currentRound: newRound,
      currentGenre: genre,
      calledGenres: [...currentGameState.calledGenres, genre],
      called_genres: [...currentGameState.called_genres, genre],
      current_call: genre,
      voting_deadline: new Date(votingDeadline),
      totalRounds: newRound
    };

    setGameState(updatedGameState);
    setTimeRemaining(300); // 5 minutes for voting
    
    toast({
      title: `🎵 Round ${newRound}: ${genre}`,
      description: "Vote for the best beat! AI spectators will vote automatically.",
    });

    // Start voting countdown
    startVotingTimer(updatedGameState);
    
    // Simulate AI spectator votes
    setTimeout(() => simulateSpectatorVotes(updatedGameState), 2000);
  };

  const startVotingTimer = (currentGameState: GameState) => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleVotingEnd(currentGameState);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const simulateSpectatorVotes = (currentGameState: GameState) => {
    // Simulate spectator votes with some randomness but slight bias toward current player
    let playerVotes = 0;
    let aiVotes = 0;
    
    mockSpectators.forEach((spectator, index) => {
      setTimeout(() => {
        // 60% chance to vote for current player, 40% for AI
        const voteForPlayer = Math.random() < 0.6;
        if (voteForPlayer) {
          playerVotes++;
          toast({
            title: `🗳️ ${spectator.username} voted for you!`,
            description: `Vote power: ${(spectator.spectator_elo / 1000).toFixed(2)}x`,
          });
        } else {
          aiVotes++;
          toast({
            title: `🗳️ ${spectator.username} voted for RhythmBot`,
            description: `Vote power: ${(spectator.spectator_elo / 1000).toFixed(2)}x`,
          });
        }
      }, (index + 1) * 1500);
    });
  };

  const handleVotingEnd = (currentGameState: GameState) => {
    // For demo, randomly determine winner (could be based on actual votes)
    const winner = Math.random() < 0.6 ? currentGameState.players[0] : currentGameState.players[1];
    
    toast({
      title: `🏆 Round Winner: ${winner.username}`,
      description: winner.id === currentPlayer.id ? "You won this round!" : "RhythmBot won this round!",
    });

    // Check for bingo
    const player1Bingo = checkBingo(currentGameState.player1Card);
    const player2Bingo = checkBingo(currentGameState.player2Card);

    if (player1Bingo || player2Bingo) {
      const gameWinner = player1Bingo ? currentGameState.players[0] : currentGameState.players[1];
      handleGameEnd(currentGameState, gameWinner);
      return;
    }

    // Continue to next round
    const activeGameState = { ...currentGameState, status: 'active' as const };
    setGameState(activeGameState);
    setTimeout(() => callNextGenre(activeGameState), 3000);
  };

  const handleGameEnd = (currentGameState: GameState, winner?: Player) => {
    const finalWinner = winner || currentGameState.players[0]; // Default to player if no winner
    
    const finalGameState: GameState = {
      ...currentGameState,
      status: 'finished',
      winner_id: finalWinner.id,
      winner: finalWinner.id
    };
    
    setGameState(finalGameState);
    
    toast({
      title: "🎉 Game Complete!",
      description: finalWinner.id === currentPlayer.id ? 
        "Congratulations! You won!" : 
        "Game over! Better luck next time!",
    });

    if (onGameEnd) {
      onGameEnd(finalWinner);
    }
  };

  const handleVote = (playerId: string) => {
    const playerName = gameState?.players?.find(p => p.id === playerId)?.username;
    toast({
      title: "Vote Submitted!",
      description: `You voted for ${playerName}`,
    });
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              Sound Royale
            </h1>
            <p className="text-2xl text-slate-300 font-medium">
              Single Player Practice Mode
            </p>
          </div>

          {/* Current player stats */}
          <div className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-6 max-w-md mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {currentPlayer.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{currentPlayer.username}</h2>
                <Badge className="bg-purple-600">{currentPlayer.role}</Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-orange-400" />
                <div className="text-orange-400 font-medium">ELO</div>
                <div className="text-2xl font-bold text-white">{currentPlayer.competitor_elo}</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <Trophy className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                <div className="text-blue-400 font-medium">W/L</div>
                <div className="text-2xl font-bold text-white">{currentPlayer.wins}/{currentPlayer.losses}</div>
                <div className="text-xs text-slate-400">
                  {currentPlayer.wins + currentPlayer.losses > 0 ? 
                    ((currentPlayer.wins / (currentPlayer.wins + currentPlayer.losses)) * 100).toFixed(1) : 0}%
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-400" />
                <div className="text-green-400 font-medium">Votes</div>
                <div className="text-2xl font-bold text-white">{currentPlayer.correct_votes}</div>
                <div className="text-xs text-slate-400">
                  {((currentPlayer.spectator_elo / 1000) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                <Sparkles className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
                <div className="text-yellow-400 font-medium">Coins</div>
                <div className="text-2xl font-bold text-white">{currentPlayer.coins}</div>
              </div>
            </div>

            <div className="text-sm text-slate-400 mb-6">
              <p>Spectator ELO: {currentPlayer.spectator_elo}</p>
              <p>Vote Power: {((currentPlayer.spectator_elo / 1000)).toFixed(2)}x</p>
            </div>
          </div>

          {/* AI Opponent Preview */}
          <div className="bg-slate-800/50 border border-cyan-500/30 rounded-xl p-6 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Your Opponent</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">🤖</span>
              </div>
              <div>
                <h4 className="font-bold text-white">RhythmBot</h4>
                <Badge className="bg-cyan-600">Silver III • AI</Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div className="text-center">
                <div className="text-orange-400">ELO</div>
                <div className="font-bold text-white">1000</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400">W/L</div>
                <div className="font-bold text-white">50/45</div>
                <div className="text-slate-400">52.6%</div>
              </div>
            </div>
            
            <p className="text-xs text-slate-400">
              Practice against AI to improve your skills before multiplayer!
            </p>
          </div>

          <Button
            onClick={startGame}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-12 py-6 text-xl rounded-xl shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-3"
          >
            <Play className="w-6 h-6" />
            Start Practice Game
          </Button>

          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Users className="w-5 h-5" />
            <span>{mockSpectators.length} AI spectators ready</span>
          </div>
        </div>
      </div>
    );
  }

  // Game UI (similar to multiplayer but simplified)
  if (!gameState) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Game Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent mb-2">
            Sound Royale
          </h1>
          <div className="flex justify-center items-center gap-6 text-lg text-slate-300">
            <span>Practice Game #{gameState.matchNumber}</span>
            <span>{gameState.called_genres?.length || 0} Genres Called</span>
            <span>{gameState.spectatorCount || 0} AI Spectators</span>
          </div>
        </div>

        {/* Timer and current genre */}
        {gameState.status === 'voting' && (
          <div className="text-center mb-6">
            <div className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-4 max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-purple-400 mb-2">
                🎵 {gameState.currentGenre}
              </h3>
              <div className="text-4xl font-bold text-white mb-2">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-slate-300">AI voting in progress...</p>
            </div>
          </div>
        )}

        {/* Players and Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {gameState.players?.map((player, index) => (
            <div key={player.id} className="space-y-4">
              <PlayerStats player={player} />
              <BingoCard
                card={index === 0 ? gameState.player1Card : gameState.player2Card}
                calledGenres={gameState.called_genres || []}
                isBlinded={false}
                playerName={player.username}
              />
            </div>
          ))}
        </div>

        {/* Voting Panel */}
        {gameState.status === 'voting' && gameState.players && (
          <div className="mb-8">
            <VotingPanel
              players={gameState.players}
              currentGenre={gameState.currentGenre || ''}
              timeRemaining={timeRemaining}
              votes={[]} // No real votes in single player
              onVote={handleVote}
              currentPlayer={currentPlayer}
            />
          </div>
        )}

        {/* Game finished */}
        {gameState.status === 'finished' && (
          <div className="text-center">
            <div className="bg-slate-800/50 border border-green-500/30 rounded-xl p-8 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-green-400 mb-4">
                🎉 Practice Complete!
              </h2>
              <p className="text-slate-300 mb-6">
                {gameState.winner_id === currentPlayer.id ? 
                  "Great job! You're ready for multiplayer!" :
                  "Keep practicing! You'll get better with time."}
              </p>
              <Button
                onClick={() => {
                  setGameStarted(false);
                  setGameState(null);
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Play Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SinglePlayerMode;
