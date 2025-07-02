
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AudioPlayer } from './AudioPlayer';
import { Timer, Users, Vote, Music } from 'lucide-react';
import { Player } from '@/types/game';

interface VoteData {
  id: string;
  playerId: string;
  voterName: string;
  power: number;
}

interface VotingPanelProps {
  players: Player[];
  currentGenre: string;
  timeRemaining: number;
  votes: VoteData[];
  onVote: (playerId: string) => void;
  currentPlayer?: Player | null;
  audioSubmissions?: Array<{
    playerId: string;
    audioUrl: string;
    playerName: string;
  }>;
}

const VotingPanel: React.FC<VotingPanelProps> = ({
  players,
  currentGenre,
  timeRemaining,
  votes,
  onVote,
  currentPlayer,
  audioSubmissions = []
}) => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  // Check if current player has already voted
  useEffect(() => {
    const userVote = votes.find(vote => vote.voterName === currentPlayer?.username);
    setHasVoted(!!userVote);
  }, [votes, currentPlayer]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getVotesForPlayer = (playerId: string) => {
    return votes.filter(vote => vote.playerId === playerId);
  };

  const getTotalVotePower = (playerId: string) => {
    return getVotesForPlayer(playerId).reduce((sum, vote) => sum + vote.power, 0);
  };

  const handleVote = (playerId: string) => {
    if (hasVoted) return;
    onVote(playerId);
    setHasVoted(true);
  };

  const handleAudioPlay = (playerId: string, isPlaying: boolean) => {
    if (isPlaying) {
      setCurrentlyPlaying(playerId);
    } else if (currentlyPlaying === playerId) {
      setCurrentlyPlaying(null);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900/60 via-purple-900/20 to-slate-900/60 backdrop-blur-xl border-0">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none rounded-lg" />
      
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                🎵 {currentGenre}
              </h3>
              <p className="text-slate-400 text-sm">Vote for the best beat</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">
              {formatTime(timeRemaining)}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Timer className="w-4 h-4" />
              <span>Time remaining</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        {/* Audio Submissions */}
        <div className="space-y-4">
          {players.map(player => {
            const submission = audioSubmissions.find(sub => sub.playerId === player.id);
            const playerVotes = getVotesForPlayer(player.id);
            const totalPower = getTotalVotePower(player.id);
            const isCurrentlyPlayingThis = currentlyPlaying === player.id;
            
            return (
              <div 
                key={player.id} 
                className={`
                  relative p-4 rounded-xl border transition-all duration-300
                  ${isCurrentlyPlayingThis 
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50 shadow-lg shadow-purple-500/25' 
                    : 'bg-slate-800/30 border-slate-700/50 hover:border-purple-500/30'
                  }
                `}
              >
                {/* Player Info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {player.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{player.username}</h4>
                      <p className="text-xs text-slate-400">ELO: {player.competitor_elo}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Vote Count */}
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-400">
                        {playerVotes.length} votes
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {totalPower.toFixed(1)}x power
                      </Badge>
                    </div>
                    
                    {/* Vote Button */}
                    <Button
                      onClick={() => handleVote(player.id)}
                      disabled={hasVoted || player.id === currentPlayer?.id}
                      size="sm"
                      className={`
                        ${hasVoted && votes.find(v => v.playerId === player.id && v.voterName === currentPlayer?.username)
                          ? 'bg-green-600 hover:bg-green-600' 
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                        }
                      `}
                    >
                      <Vote className="w-4 h-4 mr-2" />
                      {hasVoted && votes.find(v => v.playerId === player.id && v.voterName === currentPlayer?.username)
                        ? 'Voted' 
                        : player.id === currentPlayer?.id ? 'You' : 'Vote'
                      }
                    </Button>
                  </div>
                </div>

                {/* Audio Player */}
                {submission ? (
                  <AudioPlayer
                    audioUrl={submission.audioUrl}
                    title={`${player.username}'s ${currentGenre} Beat`}
                    onPlayStateChange={(isPlaying) => handleAudioPlay(player.id, isPlaying)}
                    className="bg-slate-900/30 border-slate-600/30"
                  />
                ) : (
                  <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-600/30 text-center">
                    <Music className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Beat not submitted yet</p>
                  </div>
                )}

                {/* Voter List */}
                {playerVotes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <div className="flex flex-wrap gap-2">
                      {playerVotes.map(vote => (
                        <Badge 
                          key={vote.id} 
                          variant="secondary" 
                          className="text-xs bg-slate-700/50 text-slate-300"
                        >
                          {vote.voterName} ({vote.power.toFixed(1)}x)
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Voting Status */}
        <div className="text-center p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
          <p className="text-slate-300">
            {hasVoted 
              ? "✅ Vote submitted! Results will be shown when voting ends." 
              : `🗳️ ${votes.length} total votes cast • Vote for your favorite beat!`
            }
          </p>
          {currentPlayer && (
            <p className="text-xs text-slate-400 mt-1">
              Your vote power: {((currentPlayer.spectator_elo / 1000) * 1).toFixed(2)}x
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VotingPanel;
