
import React, { useState, useEffect } from 'react';
import { Player, GameState, BingoCard as BingoCardType } from '@/types/game';
import { generateBingoCard, selectGenre, checkBingo, calculateVotePower } from '@/utils/gameLogic';
import BingoCard from './BingoCard';
import ProductionPhase from './ProductionPhase';
import VotingPhase from './VotingPhase';
import PlayerStats from './PlayerStats';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Crown, Timer } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface GameBoardProps {
  currentPlayer: Player;
  onGameEnd: (winner: Player) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ currentPlayer, onGameEnd }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState<string>();
  const [voteResults, setVoteResults] = useState<{
    player1Votes: number;
    player2Votes: number;
    totalVotes: number;
  }>();

  // Initialize demo game
  useEffect(() => {
    const demoPlayer1: Player = {
      id: 'demo-player-1',
      username: 'BeatMaster',
      competitor_elo: 1200,
      spectator_elo: 1100,
      wins: 15,
      losses: 8,
      correct_votes: 45,
      coins: 250,
      role: 'Gold II'
    };

    const demoPlayer2: Player = {
      id: 'demo-player-2',
      username: 'RhythmKing',
      competitor_elo: 1150,
      spectator_elo: 1050,
      wins: 12,
      losses: 10,
      correct_votes: 38,
      coins: 180,
      role: 'Silver III'
    };

    const demoSpectators: Player[] = [
      {
        id: 'spec-1',
        username: 'MusicLover',
        competitor_elo: 800,
        spectator_elo: 1200,
        wins: 5,
        losses: 3,
        correct_votes: 25,
        coins: 120,
        role: 'Silver III'
      },
      {
        id: 'spec-2',
        username: 'BeatCritic',
        competitor_elo: 600,
        spectator_elo: 950,
        wins: 2,
        losses: 5,
        correct_votes: 18,
        coins: 95,
        role: 'Bronze V'
      }
    ];

    const card1 = generateBingoCard();
    const card2 = generateBingoCard();
    const genre = selectGenre([], card1, card2);

    const initialGame: GameState = {
      id: 'demo-game-1',
      player1: demoPlayer1,
      player2: demoPlayer2,
      player1_card: card1,
      player2_card: card2,
      called_genres: [genre],
      current_call: genre,
      spectators: demoSpectators,
      votes: {},
      handicaps_used: [],
      status: 'production', // Start in production phase
      voting_deadline: new Date(Date.now() + 15 * 60 * 1000)
    };

    setGameState(initialGame);
    setTimeRemaining(30 * 60); // 30 minutes for production
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handlePhaseTransition();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handlePhaseTransition = () => {
    if (!gameState) return;

    if (gameState.status === 'production') {
      // Move to voting phase
      setGameState(prev => prev ? { ...prev, status: 'voting' } : null);
      setTimeRemaining(15 * 60); // 15 minutes for voting
      toast({
        title: "Voting Phase Started!",
        description: "Spectators can now vote for the better beat.",
      });
    } else if (gameState.status === 'voting') {
      // End voting, determine winner
      handleVotingEnd();
    }
  };

  const handleBeatUpload = async (playerId: string, audioFile: File) => {
    // Simulate file upload - in real app, upload to storage
    console.log(`Uploading beat for player ${playerId}:`, audioFile.name);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update game state with audio URL (simulated)
    const audioUrl = URL.createObjectURL(audioFile);
    setGameState(prev => {
      if (!prev) return null;
      return {
        ...prev,
        // In real app, store audio URLs in beat_submissions table
      };
    });
  };

  const handleReadyToggle = (playerId: string, isReady: boolean) => {
    console.log(`Player ${playerId} ready status: ${isReady}`);
    
    // Check if both players are ready
    if (gameState && gameState.status === 'production') {
      // Simulate both players being ready after one marks ready
      setTimeout(() => {
        setGameState(prev => prev ? { ...prev, status: 'voting' } : null);
        setTimeRemaining(15 * 60);
        toast({
          title: "Both Producers Ready!",
          description: "Moving to voting phase early.",
        });
      }, 2000);
    }
  };

  const handleVote = (playerId: string) => {
    if (hasVoted || !gameState) return;
    
    setHasVoted(true);
    setVotedFor(playerId);
    
    // Update vote results (simulated)
    const votePower = calculateVotePower(currentPlayer.spectator_elo);
    setVoteResults(prev => {
      const current = prev || { player1Votes: 0, player2Votes: 0, totalVotes: 0 };
      return {
        player1Votes: playerId === gameState.player1.id ? current.player1Votes + votePower : current.player1Votes,
        player2Votes: playerId === gameState.player2.id ? current.player2Votes + votePower : current.player2Votes,
        totalVotes: current.totalVotes + votePower
      };
    });
  };

  const handleVotingEnd = () => {
    if (!gameState || !voteResults) return;
    
    const winner = voteResults.player1Votes > voteResults.player2Votes ? gameState.player1 : gameState.player2;
    
    toast({
      title: "Voting Complete!",
      description: `${winner.username} wins this round and can mark their square!`,
    });
    
    // Move to active phase for square marking
    setGameState(prev => prev ? { ...prev, status: 'active', winner_id: winner.id } : null);
  };

  const handleSquareClick = (row: number, col: number) => {
    if (!gameState || gameState.status !== 'active') return;
    
    const isPlayer1 = currentPlayer.id === gameState.player1.id;
    const isPlayer2 = currentPlayer.id === gameState.player2.id;
    const canMark = (isPlayer1 || isPlayer2) && gameState.winner_id === currentPlayer.id;
    
    if (!canMark) return;
    
    setGameState(prev => {
      if (!prev) return null;
      
      const newGameState = { ...prev };
      const currentCard = isPlayer1 ? newGameState.player1_card : newGameState.player2_card;
      
      // Check if square matches current genre
      if (currentCard.squares[row][col] === prev.current_call || currentCard.squares[row][col] === 'FREE') {
        currentCard.marked[row][col] = true;
        
        // Check for bingo
        if (checkBingo(currentCard)) {
          newGameState.status = 'finished';
          newGameState.winner_id = currentPlayer.id;
          onGameEnd(currentPlayer);
          toast({
            title: "BINGO!",
            description: `${currentPlayer.username} wins the game!`,
          });
        } else {
          // Start next round
          const nextGenre = selectGenre(prev.called_genres, newGameState.player1_card, newGameState.player2_card);
          newGameState.called_genres.push(nextGenre);
          newGameState.current_call = nextGenre;
          newGameState.status = 'production';
          setTimeRemaining(30 * 60);
          setHasVoted(false);
          setVotedFor(undefined);
          setVoteResults(undefined);
        }
      }
      
      return newGameState;
    });
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Timer className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Starting Sound Royale...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-3xl text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text">
              <Crown className="w-8 h-8 text-purple-400" />
              Sound Royale
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Game Phases */}
        {gameState.status === 'production' && (
          <ProductionPhase
            player1={gameState.player1}
            player2={gameState.player2}
            currentGenre={gameState.current_call!}
            timeRemaining={timeRemaining}
            onBeatUpload={handleBeatUpload}
            onReadyToggle={handleReadyToggle}
            player1Ready={false}
            player2Ready={false}
            currentPlayer={currentPlayer}
          />
        )}

        {gameState.status === 'voting' && (
          <VotingPhase
            player1={gameState.player1}
            player2={gameState.player2}
            currentGenre={gameState.current_call!}
            timeRemaining={timeRemaining}
            spectators={gameState.spectators}
            onVote={handleVote}
            currentPlayer={currentPlayer}
            player1AudioUrl="demo-audio-1"
            player2AudioUrl="demo-audio-2"
            hasVoted={hasVoted}
            votedFor={votedFor}
            voteResults={voteResults}
          />
        )}

        {/* Bingo Cards (shown after voting or during active phase) */}
        {(gameState.status === 'active' || gameState.status === 'finished') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BingoCard
              card={gameState.player1_card}
              onSquareClick={handleSquareClick}
              isClickable={gameState.status === 'active' && gameState.winner_id === gameState.player1.id}
              playerName={gameState.player1.username}
            />
            <BingoCard
              card={gameState.player2_card}
              onSquareClick={handleSquareClick}
              isClickable={gameState.status === 'active' && gameState.winner_id === gameState.player2.id}
              playerName={gameState.player2.username}
            />
          </div>
        )}

        {/* Player Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PlayerStats player={gameState.player1} />
          <PlayerStats player={gameState.player2} />
        </div>

        {/* Game Over */}
        {gameState.status === 'finished' && (
          <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-2xl text-yellow-400">
                <Trophy className="w-8 h-8" />
                Game Complete!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-xl text-white mb-4">
                🎉 {gameState.player1.id === gameState.winner_id ? gameState.player1.username : gameState.player2.username} wins!
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Play Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
