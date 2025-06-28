
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Pause, Vote, Users } from 'lucide-react';
import { Player } from '@/types/game';
import { toast } from '@/hooks/use-toast';

interface VotingPhaseProps {
  player1: Player;
  player2: Player;
  currentGenre: string;
  timeRemaining: number;
  spectators: Player[];
  onVote: (playerId: string) => void;
  currentPlayer: Player;
  player1AudioUrl?: string;
  player2AudioUrl?: string;
  hasVoted: boolean;
  votedFor?: string;
  voteResults?: {
    player1Votes: number;
    player2Votes: number;
    totalVotes: number;
  };
}

const VotingPhase: React.FC<VotingPhaseProps> = ({
  player1,
  player2,
  currentGenre,
  timeRemaining,
  spectators,
  onVote,
  currentPlayer,
  player1AudioUrl,
  player2AudioUrl,
  hasVoted,
  votedFor,
  voteResults
}) => {
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{[key: string]: HTMLAudioElement}>({});

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((15 * 60 - timeRemaining) / (15 * 60)) * 100;
  const isSpectator = !([player1.id, player2.id].includes(currentPlayer.id));

  useEffect(() => {
    // Create audio elements for both players
    const elements: {[key: string]: HTMLAudioElement} = {};
    
    if (player1AudioUrl) {
      elements[player1.id] = new Audio(player1AudioUrl);
      elements[player1.id].addEventListener('ended', () => setPlayingAudio(null));
    }
    
    if (player2AudioUrl) {
      elements[player2.id] = new Audio(player2AudioUrl);
      elements[player2.id].addEventListener('ended', () => setPlayingAudio(null));
    }
    
    setAudioElements(elements);
    
    return () => {
      // Cleanup audio elements
      Object.values(elements).forEach(audio => {
        audio.pause();
        audio.removeEventListener('ended', () => setPlayingAudio(null));
      });
    };
  }, [player1AudioUrl, player2AudioUrl, player1.id, player2.id]);

  const handlePlayPause = (playerId: string) => {
    const audio = audioElements[playerId];
    if (!audio) return;

    if (playingAudio === playerId) {
      audio.pause();
      setPlayingAudio(null);
    } else {
      // Stop any currently playing audio
      Object.values(audioElements).forEach(a => a.pause());
      
      audio.play();
      setPlayingAudio(playerId);
    }
  };

  const handleVote = (playerId: string) => {
    if (!isSpectator || hasVoted) return;
    
    onVote(playerId);
    toast({
      title: "Vote Submitted!",
      description: `You voted for ${playerId === player1.id ? player1.username : player2.username}`,
    });
  };

  const getVotePercentage = (playerId: string) => {
    if (!voteResults || voteResults.totalVotes === 0) return 0;
    const votes = playerId === player1.id ? voteResults.player1Votes : voteResults.player2Votes;
    return (votes / voteResults.totalVotes) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Timer and Genre Display */}
      <Card className="bg-slate-800/50 border-cyan-500/30">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl text-cyan-400">
            <Vote className="w-6 h-6" />
            Voting Phase: {currentGenre}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Clock className="w-8 h-8 text-cyan-400" />
              {formatTime(timeRemaining)}
            </div>
            <Progress value={progressPercentage} className="w-full h-3" />
            <p className="text-slate-400 mt-2">Time remaining to vote</p>
          </div>
        </CardContent>
      </Card>

      {/* Spectators List */}
      <Card className="bg-slate-800/50 border-slate-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-300">
            <Users className="w-5 h-5" />
            Spectators ({spectators.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {spectators.map((spectator) => (
              <Badge key={spectator.id} variant="outline" className="border-slate-600 text-slate-300">
                {spectator.username}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Beat Submissions and Voting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Player 1 */}
        <Card className="bg-slate-800/50 border-slate-600">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-cyan-400">{player1.username}</span>
              {hasVoted && votedFor === player1.id && (
                <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                  Your Vote
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">Producer 1 • ELO: {player1.competitor_elo}</p>
            
            {/* Audio Player */}
            {player1AudioUrl && (
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => handlePlayPause(player1.id)}
                  variant="outline"
                  size="sm"
                  className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                >
                  {playingAudio === player1.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <span className="text-sm text-slate-400">Listen to beat</span>
              </div>
            )}
            
            {/* Vote Results */}
            {voteResults && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Votes</span>
                  <span className="text-white">{voteResults.player1Votes}</span>
                </div>
                <Progress value={getVotePercentage(player1.id)} className="h-2" />
              </div>
            )}
            
            {/* Vote Button */}
            {isSpectator && (
              <Button
                onClick={() => handleVote(player1.id)}
                disabled={hasVoted}
                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50"
              >
                {hasVoted ? 'Vote Cast' : `Vote for ${player1.username}`}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Player 2 */}
        <Card className="bg-slate-800/50 border-slate-600">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-pink-400">{player2.username}</span>
              {hasVoted && votedFor === player2.id && (
                <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                  Your Vote
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-300">Producer 2 • ELO: {player2.competitor_elo}</p>
            
            {/* Audio Player */}
            {player2AudioUrl && (
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => handlePlayPause(player2.id)}
                  variant="outline"
                  size="sm"
                  className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
                >
                  {playingAudio === player2.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <span className="text-sm text-slate-400">Listen to beat</span>
              </div>
            )}
            
            {/* Vote Results */}
            {voteResults && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Votes</span>
                  <span className="text-white">{voteResults.player2Votes}</span>
                </div>
                <Progress value={getVotePercentage(player2.id)} className="h-2" />
              </div>
            )}
            
            {/* Vote Button */}
            {isSpectator && (
              <Button
                onClick={() => handleVote(player2.id)}
                disabled={hasVoted}
                className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-50"
              >
                {hasVoted ? 'Vote Cast' : `Vote for ${player2.username}`}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Producer View */}
      {!isSpectator && (
        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-purple-400">Producer View</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">
              Spectators are voting on the beats! Results will be revealed when voting ends.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-slate-400">• Winner gets to mark their bingo square</p>
              <p className="text-sm text-slate-400">• ELO will be updated based on the result</p>
              <p className="text-sm text-slate-400">• First to get BINGO wins the match!</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VotingPhase;
