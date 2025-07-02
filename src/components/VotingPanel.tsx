import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Timer, Users, Vote, Zap } from 'lucide-react';
import { Player } from '@/types/game';

interface Vote {
  id?: string;
  playerId: string;
  voterName: string;
  power: number;
}

interface VotingPanelProps {
  players: Player[];
  currentGenre: string;
  timeRemaining: number;
  votes: Vote[];
  onVote: (playerId: string) => void;
  currentPlayer?: Player;
}

const VotingPanel: React.FC<VotingPanelProps> = ({
  players,
  currentGenre,
  timeRemaining,
  votes,
  onVote,
  currentPlayer
}) => {
  const totalSpectators = players.reduce((acc, player) => acc + player.spectator_elo, 0);

  const getPlayerVotePercentage = (playerId: string) => {
    const playerVotes = votes.filter(vote => vote.playerId === playerId);
    const totalVotePower = playerVotes.reduce((sum, vote) => sum + vote.power, 0);
    return (totalVotePower / totalSpectators) * 100;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Spectator Voting
          <Badge className="ml-2">{currentGenre}</Badge>
        </CardTitle>
        <p className="text-sm text-slate-400">
          Cast your vote for the best beat!
        </p>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Timer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-slate-400">Time Remaining:</span>
          </div>
          <span className="font-medium text-white">{formatTime(timeRemaining)}</span>
        </div>

        {/* Players */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {players.map((player) => (
            <div key={player.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center">
                    {player.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-200">{player.username}</span>
                  <Badge className="ml-1">{player.role}</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onVote(player.id)}
                  disabled={currentPlayer?.id === player.id}
                >
                  {currentPlayer?.id === player.id ? 'Voted' : 'Vote'}
                </Button>
              </div>
              <Progress value={getPlayerVotePercentage(player.id)} className="h-2" />
            </div>
          ))}
        </div>

        {/* Vote Tally */}
        <div>
          <h4 className="text-sm font-medium text-slate-300">Vote Tally</h4>
          <ul className="mt-2 space-y-1">
            {votes.map((vote) => (
              <li key={vote.playerId} className="flex items-center justify-between text-xs text-slate-400">
                <span>{vote.voterName}</span>
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span>{vote.power.toFixed(2)}x</span>
                  <Vote className="w-3 h-3 text-purple-400" />
                  <span>{players.find(p => p.id === vote.playerId)?.username}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Spectator Count */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Users className="w-3 h-3" />
          <span>{players.length} Spectators are watching and voting</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default VotingPanel;
