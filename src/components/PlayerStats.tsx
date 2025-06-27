
import React from 'react';
import { Player } from '@/types/game';
import { getPlayerRole } from '@/utils/gameLogic';
import { Trophy, Target, Coins, TrendingUp } from 'lucide-react';

interface PlayerStatsProps {
  player: Player;
  isCompact?: boolean;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ player, isCompact = false }) => {
  const winRate = player.wins + player.losses > 0 ? 
    ((player.wins / (player.wins + player.losses)) * 100).toFixed(1) : '0.0';
  
  const voteAccuracy = player.correct_votes > 0 ? 
    (player.correct_votes / Math.max(player.wins + player.losses, 1) * 100).toFixed(1) : '0.0';

  const role = getPlayerRole(player.competitor_elo);

  if (isCompact) {
    return (
      <div className="bg-slate-800/60 border border-purple-500/20 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-cyan-400">{player.username}</h3>
          <span className="text-xs px-2 py-1 bg-purple-600/30 text-purple-200 rounded">
            {role}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <TrendingUp size={12} />
            <span>{player.competitor_elo}</span>
          </div>
          <div className="flex items-center gap-1">
            <Coins size={12} />
            <span>{player.coins}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/80 border border-purple-500/30 rounded-lg p-6 space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-cyan-400 mb-1">{player.username}</h2>
        <div className="inline-flex px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-full">
          {role}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-slate-700/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp size={16} className="text-purple-400" />
            <span className="text-xs text-slate-400">ELO</span>
          </div>
          <p className="text-lg font-bold text-white">{player.competitor_elo}</p>
        </div>

        <div className="text-center p-3 bg-slate-700/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy size={16} className="text-yellow-400" />
            <span className="text-xs text-slate-400">W/L</span>
          </div>
          <p className="text-lg font-bold text-white">{player.wins}/{player.losses}</p>
          <p className="text-xs text-green-400">{winRate}%</p>
        </div>

        <div className="text-center p-3 bg-slate-700/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Target size={16} className="text-cyan-400" />
            <span className="text-xs text-slate-400">Votes</span>
          </div>
          <p className="text-lg font-bold text-white">{player.correct_votes}</p>
          <p className="text-xs text-cyan-400">{voteAccuracy}%</p>
        </div>

        <div className="text-center p-3 bg-slate-700/50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Coins size={16} className="text-yellow-400" />
            <span className="text-xs text-slate-400">Coins</span>
          </div>
          <p className="text-lg font-bold text-white">{player.coins}</p>
        </div>
      </div>

      <div className="text-center text-sm text-slate-400">
        <p>Spectator ELO: {player.spectator_elo}</p>
        <p>Vote Power: {Math.min(1.0 + (player.spectator_elo / 1000), 2.5).toFixed(2)}x</p>
      </div>
    </div>
  );
};

export default PlayerStats;
