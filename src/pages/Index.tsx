
import React, { useState } from 'react';
import GameBoard from '@/components/GameBoard';
import { Player } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Gamepad2 } from 'lucide-react';

const Index = () => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [username, setUsername] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinAsSpectator = () => {
    if (!username.trim()) return;
    
    const newPlayer: Player = {
      id: `player_${Date.now()}`,
      username: username.trim(),
      competitor_elo: 500,
      spectator_elo: 1000,
      wins: 0,
      losses: 0,
      correct_votes: 0,
      coins: 100,
      role: 'Bronze V'
    };
    
    setCurrentPlayer(newPlayer);
    setIsJoining(false);
  };

  const handleGameEnd = (winner: Player) => {
    console.log(`Game ended! Winner: ${winner.username}`);
    // Here you would typically update the database and player stats
  };

  if (!currentPlayer && !isJoining) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              Beat Bingo Battle
            </h1>
            <p className="text-2xl text-slate-300 font-medium">
              Discord-Integrated Music Genre Battle Royale
            </p>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Join real-time bingo battles with smart genre calling, weighted spectator voting, and competitive ELO rankings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
            <div className="bg-slate-800/60 border border-purple-500/30 rounded-lg p-6 text-center">
              <Gamepad2 className="mx-auto mb-4 text-purple-400" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">Smart Gameplay</h3>
              <p className="text-slate-300">AI-powered genre selection ensures every game is competitive and engaging</p>
            </div>
            
            <div className="bg-slate-800/60 border border-cyan-500/30 rounded-lg p-6 text-center">
              <Users className="mx-auto mb-4 text-cyan-400" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">Spectator Voting</h3>
              <p className="text-slate-300">ELO-weighted voting system with real-time engagement and rewards</p>
            </div>
            
            <div className="bg-slate-800/60 border border-pink-500/30 rounded-lg p-6 text-center">
              <Trophy className="mx-auto mb-4 text-pink-400" size={48} />
              <h3 className="text-xl font-bold text-white mb-2">Competitive Ranking</h3>
              <p className="text-slate-300">Climb from Bronze V to Grandmaster with dynamic ELO progression</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">5x5 Bingo Cards</Badge>
              <Badge className="bg-cyan-600/20 text-cyan-300 border-cyan-500/30">25 Music Genres</Badge>
              <Badge className="bg-pink-600/20 text-pink-300 border-pink-500/30">Handicap System</Badge>
              <Badge className="bg-green-600/20 text-green-300 border-green-500/30">Real-time Voting</Badge>
              <Badge className="bg-yellow-600/20 text-yellow-300 border-yellow-500/30">Discord Integration</Badge>
            </div>

            <Button
              onClick={() => setIsJoining(true)}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-12 py-6 text-xl rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
            >
              Join the Battle
            </Button>
            
            <p className="text-sm text-slate-400">
              Or connect with Discord for full features and leaderboard integration
            </p>
          </div>

          <div className="bg-slate-800/30 border border-purple-500/20 rounded-lg p-6 text-left max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-cyan-400 mb-3">How It Works:</h3>
            <ol className="text-slate-300 space-y-2">
              <li>1. Two players get unique 5x5 bingo cards with music genres</li>
              <li>2. AI calls genres that exist on at least one player's card</li>
              <li>3. Spectators vote on who performed the genre better (5min window)</li>
              <li>4. Winner marks their square; first to get BINGO wins!</li>
              <li>5. ELO ratings update based on performance and voting accuracy</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (isJoining) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/80 border border-purple-500/30 rounded-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6 text-center">Join as Spectator</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                Choose your username
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username..."
                className="bg-slate-700 border-slate-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleJoinAsSpectator()}
              />
            </div>
            
            <div className="text-sm text-slate-400 space-y-1">
              <p>• Starting ELO: 1000 (Spectator), 500 (Competitor)</p>
              <p>• Starting coins: 100</p>
              <p>• Vote power: 1.0x (increases with ELO)</p>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleJoinAsSpectator}
                disabled={!username.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Join Game
              </Button>
              <Button
                onClick={() => setIsJoining(false)}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <GameBoard currentPlayer={currentPlayer} onGameEnd={handleGameEnd} />;
};

export default Index;
