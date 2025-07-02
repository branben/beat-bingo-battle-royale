import React, { useState, useEffect } from 'react';
import { GameState, Player } from '@/types/game';
import { selectGenre, checkBingo } from '@/utils/gameLogic';
import BingoCard from './BingoCard';
import VotingPanel from './VotingPanel';
import PlayerStats from './PlayerStats';
import { GameAnalytics } from './GameAnalytics';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Play, Users, CheckCircle, Clock, Timer, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

// Real database hooks
import { 
  useMatches, 
  useMatch, 
  useCreateMatch, 
  useJoinMatch, 
  useUpdateMatchStatus,
  matchToGameState,
  type Match 
} from '@/hooks/useMatches';
import { 
  useMatchVotes, 
  useSubmitVote, 
  useRoundResults 
} from '@/hooks/useVoting';
import { useGameRealtime } from '@/hooks/useRealtime';

interface GameBoardProps {
  currentPlayer?: Player;
  onGameEnd?: (winner: Player) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ currentPlayer, onGameEnd }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [blindedPlayers, setBlindedPlayers] = useState<Set<string>>(new Set());
  const [playersReady, setPlayersReady] = useState<Set<string>>(new Set());
  const [wonGenres, setWonGenres] = useState<Record<string, string[]>>({});
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

  // Real-time synchronization
  const { syncGameState, submitVote } = useRealtimeSync({
    matchId: currentMatchId || '',
    onGameStateUpdate: (updates) => {
      setGameState(prev => prev ? { ...prev, ...updates } : null);
    },
    onVoteUpdate: (vote) => {
      console.log('New vote received:', vote);
      // Handle vote updates in real-time
    },
    onPlayerJoin: (playerId) => {
      toast({
        title: "Player Joined",
        description: `A spectator joined the match!`,
      });
    },
    onPlayerLeave: (playerId) => {
      toast({
        title: "Player Left",
        description: `A spectator left the match.`,
      });
    }
  });

  // Database hooks
  const { data: matches, isLoading: matchesLoading } = useMatches();
  const { data: currentMatch, isLoading: matchLoading } = useMatch(currentMatchId || '');
  const createMatchMutation = useCreateMatch();
  const joinMatchMutation = useJoinMatch();
  const updateMatchMutation = useUpdateMatchStatus();
  const submitVoteMutation = useSubmitVote();
  const { data: currentVotes } = useMatchVotes(currentMatchId || '', gameState?.currentRound || 0);
  const { data: roundResults } = useRoundResults(
    currentMatchId || '', 
    gameState?.currentRound || 0
  );

  // Real-time subscriptions
  useGameRealtime(currentMatchId || '', gameState?.currentRound || 0);

  // Helper function to format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Convert current match to game state
  useEffect(() => {
    if (currentMatch && currentPlayer) {
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
          correct_votes: 15,
          coins: 80,
          role: 'Silver III'
        }
      ];

      const newGameState = matchToGameState(currentMatch, mockSpectators);
      setGameState(newGameState);
    }
  }, [currentMatch, currentPlayer]);

  // Create a new match
  const handleCreateMatch = async () => {
    if (!currentPlayer) return;

    try {
      // Create a match waiting for another player (no player2 initially)
      const match = await createMatchMutation.mutateAsync({
        player1Id: currentPlayer.id,
        player2Id: null // Will be filled when someone joins
      });

      setCurrentMatchId(match.id);
      toast({
        title: "Match Created!",
        description: "Both players must ready up to begin.",
      });
    } catch (error) {
      console.error('Error creating match:', error);
      toast({
        title: "Error",
        description: "Failed to create match. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Join an existing match
  const handleJoinMatch = async (matchId: string) => {
    if (!currentPlayer) return;

    try {
      const match = await joinMatchMutation.mutateAsync({
        matchId,
        playerId: currentPlayer.id
      });

      setCurrentMatchId(match.id);
      toast({
        title: "Joined Match!",
        description: "Waiting for both players to ready up.",
      });
    } catch (error) {
      console.error('Error joining match:', error);
      toast({
        title: "Error",
        description: "Failed to join match. It may be full or no longer available.",
        variant: "destructive"
      });
    }
  };

  // Handle player ready
  const handlePlayerReady = async (playerId: string) => {
    if (!currentMatchId || !gameState) return;

    const newReadyPlayers = new Set(playersReady).add(playerId);
    setPlayersReady(newReadyPlayers);

    // If both players are ready, start the match
    if (newReadyPlayers.size === 2) {
      try {
        await updateMatchMutation.mutateAsync({
          matchId: currentMatchId,
          status: 'active',
          updates: {
            round_start_time: new Date().toISOString(),
            current_round: 1
          }
        });

        toast({
          title: "Game Started!",
          description: "Both players are ready. The first genre will be called shortly.",
        });

        // Start the first round
        setTimeout(() => callNextGenre(), 2000);
      } catch (error) {
        console.error('Error starting match:', error);
        toast({
          title: "Error",
          description: "Failed to start match. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  // Call next genre
  const callNextGenre = async () => {
    if (!currentMatchId || !gameState || gameState.status !== 'active') return;

    try {
      const player1_genres = gameState.player1Card?.squares?.flat() || [];
      const player2_genres = gameState.player2Card?.squares?.flat() || [];
      const genre = selectGenre(player1_genres, player2_genres, gameState.called_genres);

      if (!genre) {
        await handleGameEnd();
        return;
      }

      const newRound = gameState.currentRound + 1;
      const votingDeadline = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes from now

      // Sync state in real-time
      await syncGameState({
        status: 'voting',
        currentGenre: genre,
        currentRound: newRound,
        calledGenres: [...gameState.called_genres, genre],
        voting_deadline: votingDeadline,
        totalRounds: newRound
      });

      setTimeRemaining(300); // 5 minutes for voting
      
      toast({
        title: `🎵 Genre Called: ${genre}`,
        description: "Players have 30 minutes to create their beats. Voting begins after submissions!",
      });

      // Start voting countdown
      startVotingTimer();
    } catch (error) {
      console.error('Error calling genre:', error);
      toast({
        title: "Error",
        description: "Failed to call next genre. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Start voting timer
  const startVotingTimer = () => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleVotingEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle voting end
  const handleVotingEnd = async () => {
    if (!currentMatchId || !gameState || !roundResults) return;

    try {
      const winnerId = roundResults.winner;
      
      if (winnerId && gameState.players) {
        const winnerPlayer = gameState.players.find(p => p.id === winnerId);
        
        if (winnerPlayer) {
          // Update analytics
          setGameAnalytics(prev => ({
            ...prev,
            totalVotes: prev.totalVotes + roundResults.totalVotes,
            roundDetails: [...prev.roundDetails, {
              round: gameState.currentRound,
              genre: gameState.currentGenre || '',
              winner: winnerPlayer.username,
              votingMargin: roundResults.totalPower,
              timeTaken: 300 - timeRemaining
            }]
          }));

          // Check for bingo
          if (checkBingo(gameState.player1Card) || 
              checkBingo(gameState.player2Card)) {
            await handleGameEnd(winnerId);
            return;
          }
        }
      }

      // Continue to next round
      await updateMatchMutation.mutateAsync({
        matchId: currentMatchId,
        status: 'active'
      });

      setTimeout(() => callNextGenre(), 3000);
    } catch (error) {
      console.error('Error ending voting:', error);
    }
  };

  // Handle game end
  const handleGameEnd = async (winnerId?: string) => {
    if (!currentMatchId || !gameState) return;

    try {
      await updateMatchMutation.mutateAsync({
        matchId: currentMatchId,
        status: 'finished',
        updates: {
          winner_id: winnerId,
          match_duration_seconds: Math.floor((Date.now() - gameAnalytics.startTime) / 1000)
        }
      });

      if (winnerId && gameState.players) {
        const winner = gameState.players.find(p => p.id === winnerId);
        if (winner && onGameEnd) {
          onGameEnd(winner);
        }
      }

      toast({
        title: "🎉 Game Complete!",
        description: winnerId ? "Winner determined!" : "Game ended in a draw.",
      });
    } catch (error) {
      console.error('Error ending game:', error);
    }
  };

  // Handle vote submission
  const handleVote = async (playerId: string) => {
    if (!currentPlayer || !currentMatchId || !gameState?.currentGenre) return;

    try {
      await submitVote(playerId, currentPlayer.spectator_elo);
      
      toast({
        title: "Vote Submitted!",
        description: `You voted for ${gameState.players?.find(p => p.id === playerId)?.username}`,
      });
    } catch (error: any) {
      console.error('Error submitting vote:', error);
      toast({
        title: "Error",
        description: "Failed to submit vote. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Mock audio submissions for demonstration
  const audioSubmissions = gameState?.players?.map(player => ({
    playerId: player.id,
    audioUrl: `https://example.com/audio/${player.id}-${gameState.currentGenre}.mp3`,
    playerName: player.username
  })) || [];

  // Show match selection if no active match
  if (!currentMatchId && matches) {
    const availableMatches = matches.filter(m => m.status === 'waiting' && !m.player2_id);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              Sound Royale
            </h1>
            <p className="text-2xl text-slate-300 font-medium">
              Compete in real-time bingo battles with music genres. Vote, strategize, and climb the leaderboard!
            </p>
          </div>

          {/* Current player stats */}
          {currentPlayer && (
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-6">
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
                
                <div className="grid grid-cols-4 gap-4 text-sm">
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
                      {((currentPlayer.wins / (currentPlayer.wins + currentPlayer.losses)) * 100).toFixed(1)}%
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
                
                <div className="mt-4 text-sm text-slate-400">
                  <p>Spectator ELO: {currentPlayer.spectator_elo}</p>
                  <p>Vote Power: {((currentPlayer.spectator_elo / 1000) * 1).toFixed(2)}x</p>
                </div>
              </div>

              {/* Available matches or opponent */}
              <div className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-6">
                {availableMatches.length > 0 ? (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Join Existing Match</h3>
                    {availableMatches.slice(0, 1).map(match => (
                      <div key={match.id} className="bg-slate-900/50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-white">{match.player1?.username || 'Unknown'}</h4>
                            <p className="text-sm text-slate-400">Waiting for opponent...</p>
                          </div>
                          <Button 
                            onClick={() => handleJoinMatch(match.id)}
                            className="bg-purple-600 hover:bg-purple-700"
                            disabled={joinMatchMutation.isPending}
                          >
                            {joinMatchMutation.isPending ? 'Joining...' : 'Join Battle'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Mock Opponent Ready</h3>
                    <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">R</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-white">RhythmKing</h4>
                          <Badge className="bg-cyan-600">Silver III</Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 text-xs mb-4">
                        <div className="text-center">
                          <div className="text-orange-400">ELO</div>
                          <div className="font-bold text-white">1180</div>
                        </div>
                        <div className="text-center">
                          <div className="text-blue-400">W/L</div>
                          <div className="font-bold text-white">12/10</div>
                          <div className="text-slate-400">54.5%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-green-400">Votes</div>
                          <div className="font-bold text-white">38</div>
                          <div className="text-slate-400">172.7%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-yellow-400">Coins</div>
                          <div className="font-bold text-white">180</div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-slate-400 mb-4">
                        <p>Spectator ELO: 950</p>
                        <p>Vote Power: 1.95x</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <Button
            onClick={handleCreateMatch}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-12 py-6 text-xl rounded-xl shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-3"
            disabled={createMatchMutation.isPending}
          >
            <Play className="w-6 h-6" />
            {createMatchMutation.isPending ? 'Creating...' : 'Start New Battle'}
          </Button>

          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Users className="w-5 h-5" />
            <span>{matches?.length || 0} spectators ready</span>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (matchLoading || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400 mb-4"></div>
          <p className="text-white text-xl">Loading match...</p>
        </div>
      </div>
    );
  }

  // Rest of the existing game UI...
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Game Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent mb-2">
            Sound Royale
          </h1>
          <div className="flex justify-center items-center gap-6 text-lg text-slate-300">
            <span>Game #{gameState.matchNumber || '---'}</span>
            <span>{gameState.called_genres?.length || 0} Genres Called</span>
            <span>{gameState.spectatorCount || 0} Spectators</span>
          </div>
        </div>

        {/* Game Status Display */}
        {gameState.status === 'waiting' && (
          <div className="text-center mb-8">
            <div className="bg-slate-800/50 border border-yellow-500/30 rounded-xl p-6 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center justify-center gap-2">
                <Timer className="w-6 h-6" />
                Waiting for Players to Ready Up
              </h2>
              <p className="text-slate-300 mb-6">Both competitors must agree before the first genre is called</p>
              
              <div className="grid grid-cols-2 gap-6">
                {gameState.players?.map((player, index) => (
                  <div key={player.id} className="bg-slate-900/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {player.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-white font-bold">{player.username}</span>
                      {playersReady.has(player.id) && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                    
                    {player.id === currentPlayer?.id && !playersReady.has(player.id) && (
                      <Button
                        onClick={() => handlePlayerReady(player.id)}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Mark Ready
                      </Button>
                    )}
                    
                    {player.id !== currentPlayer?.id && (
                      <Button
                        onClick={() => handlePlayerReady(player.id)}
                        variant="outline"
                        className="w-full"
                        disabled={playersReady.has(player.id)}
                      >
                        {playersReady.has(player.id) ? 'Ready' : 'Mark Ready'}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <p className="text-sm text-slate-400 mt-4">
                {playersReady.size}/2 players ready • Once both are ready, the first genre will be called automatically
              </p>
            </div>
          </div>
        )}

        {/* Active game content */}
        {gameState.status !== 'waiting' && (
          <>
            {/* Timer and current genre */}
            {gameState.status === 'voting' && (
              <div className="text-center mb-6">
                <div className="bg-gradient-to-br from-slate-800/50 via-purple-900/20 to-slate-800/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4 max-w-md mx-auto">
                  <h3 className="text-2xl font-bold text-purple-400 mb-2">
                    🎵 {gameState.currentGenre}
                  </h3>
                  <div className="text-4xl font-bold text-white mb-2">
                    {formatTime(timeRemaining)}
                  </div>
                  <p className="text-slate-300">Time remaining to vote</p>
                </div>
              </div>
            )}

            {/* Players and Enhanced Bingo Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {gameState.players?.map((player, index) => (
                <div key={player.id} className="space-y-4">
                  <PlayerStats player={player} />
                  <BingoCard
                    card={index === 0 ? gameState.player1Card : gameState.player2Card}
                    calledGenres={gameState.called_genres || []}
                    isBlinded={blindedPlayers.has(player.id)}
                    playerName={player.username}
                    wonGenres={wonGenres[player.id] || []}
                    isCurrentPlayer={player.id === currentPlayer?.id}
                  />
                </div>
              ))}
            </div>

            {/* Enhanced Voting Panel with Audio Playback */}
            {gameState.status === 'voting' && gameState.players && (
              <div className="mb-8">
                <VotingPanel
                  players={gameState.players}
                  currentGenre={gameState.currentGenre || ''}
                  timeRemaining={timeRemaining}
                  votes={[]} // This would come from useMatchVotes hook
                  onVote={handleVote}
                  currentPlayer={currentPlayer}
                  audioSubmissions={audioSubmissions}
                />
              </div>
            )}
          </>
        )}

        {/* Game Analytics */}
        {gameState.status === 'finished' && (
          <div className="mb-8">
            <GameAnalytics 
              gameState={gameState}
              gameDuration={Math.floor((Date.now() - gameAnalytics.startTime) / 1000)}
              totalVotes={gameAnalytics.totalVotes}
              roundDetails={gameAnalytics.roundDetails}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
