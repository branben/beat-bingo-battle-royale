
import React, { useState, useEffect } from 'react';
import { Player, Vote } from '@/types/game';
import { calculateVotePower } from '@/utils/gameLogic';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, Timer, Coins } from 'lucide-react';

interface VotingPanelProps {
  player1: Player;
  player2: Player;
  spectators: Player[];
  votes: Record<string, string>;
  onVote: (playerId: string) => void;
  currentSpectator?: Player;
  timeRemaining: number;
  currentGenre: string;
}

const VotingPanel: React.FC<VotingPanelProps> = ({
  player1,
  player2,
  spectators,
  votes,
  onVote,
  currentSpectator,
  timeRemaining,
  currentGenre
}) => {
  const [voteCounts, setVoteCounts] = useState({ player1: 0, player2: 0 });
  const [voteWeights, setVoteWeights] = useState({ player1: 0, player2: 0 });

  useEffect(() => {
    const p1Votes = Object.entries(votes).filter(([_, playerId]) => playerId === player1.id);
    const p2Votes = Object.entries(votes).filter(([_, playerId]) => playerId === player2.id);

    const p1Weight = p1Votes.reduce((sum, [spectatorId]) => {
      const spectator = spectators.find(s => s.id === spectatorId);
      return sum + (spectator ? calculateVotePower(spectator.spectator_elo) : 1);
    }, 0);

    const p2Weight = p2Votes.reduce((sum, [spectatorId]) => {
      const spectator = spectators.find(s => s.id === spectatorId);
      return sum + (spectator ? calculateVotePower(spectator.spectator_elo) : 1);
    }, 0);

    setVoteCounts({ player1: p1Votes.length, player2: p2Votes.length });
    setVoteWeights({ player1: p1Weight, player2: p2Weight });
  }, [votes, spectators, player1.id, player2.id]);

  const totalWeight = voteWeights.player1 + voteWeights.player2;
  const p1Percentage = totalWeight > 0 ? (voteWeights.player1 / totalWeight) * 100 : 50;
  const p2Percentage = totalWeight > 0 ? (voteWeights.player2 / totalWeight) * 100 : 50;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-800/80 border border-purple-500/30 rounded-lg p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-cyan-400 mb-2">Voting Phase</h2>
        <p className="text-lg text-purple-300">Current Genre: <span className="font-bold text-white">{currentGenre}</span></p>
        
        <div className="flex items-center justify-center gap-4 mt-4 text-slate-300">
          <div className="flex items-center gap-2">
            <Users size={18} />
            <span>{spectators.length} Spectators</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer size={18} />
            <span className={timeRemaining <= 30 ? "text-red-400 font-bold" : ""}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-center">
            <h3 className="font-bold text-cyan-400">{player1.username}</h3>
            <p className="text-sm text-slate-400">ELO: {player1.competitor_elo}</p>
          </div>
          <div className="text-center">
            <h3 className="font-bold text-cyan-400">{player2.username}</h3>
            <p className="text-sm text-slate-400">ELO: {player2.competitor_elo}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{voteCounts.player1} votes ({voteWeights.player1.toFixed(1)} weight)</span>
            <span>{voteCounts.player2} votes ({voteWeights.player2.toFixed(1)} weight)</span>
          </div>
          <Progress value={p1Percentage} className="h-3" />
          <div className="flex justify-between text-xs text-slate-400">
            <span>{p1Percentage.toFixed(1)}%</span>
            <span>{p2Percentage.toFixed(1)}%</span>
          </div>
        </div>

        {currentSpectator && (
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => onVote(player1.id)}
              disabled={votes[currentSpectator.id] === player1.id}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Vote for {player1.username}
            </Button>
            <Button
              onClick={() => onVote(player2.id)}
              disabled={votes[currentSpectator.id] === player2.id}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
            >
              Vote for {player2.username}
            </Button>
          </div>
        )}

        {currentSpectator && votes[currentSpectator.id] && (
          <div className="text-center p-3 bg-green-900/30 border border-green-500/30 rounded-lg">
            <p className="text-green-400 font-medium">
              Vote cast for {votes[currentSpectator.id] === player1.id ? player1.username : player2.username}
            </p>
            <p className="text-sm text-slate-400">
              Vote power: {calculateVotePower(currentSpectator.spectator_elo).toFixed(2)}x
            </p>
          </div>
        )}
      </div>

      <div className="text-center text-sm text-slate-400">
        <p>Approval requires &gt;55% weighted votes</p>
        <p className="flex items-center justify-center gap-1 mt-1">
          <Coins size={14} />
          Reward: 10 + (streak × 2) coins for correct voters
        </p>
      </div>
    </div>
  );
};

export default VotingPanel;
