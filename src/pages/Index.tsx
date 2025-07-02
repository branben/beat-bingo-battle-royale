
import React, { useState } from 'react';
import GameBoard from '@/components/GameBoard_v2';
import SinglePlayerMode from '@/components/SinglePlayerMode';
import { Player } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Gamepad2, LogIn, Mail } from 'lucide-react';
import { AuthService, AuthUser } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

interface IndexProps {
  initialPlayer: Player | null;
  initialAuthUser: AuthUser | null;
}

const Index: React.FC<IndexProps> = ({ initialPlayer, initialAuthUser }) => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(initialPlayer);
  const [authUser, setAuthUser] = useState<AuthUser | null>(initialAuthUser);
  const [isJoining, setIsJoining] = useState(false);
  const [username, setUsername] = useState('');
  const [gameMode, setGameMode] = useState<'menu' | 'single' | 'multi'>('menu');
  const navigate = useNavigate();

  const handleDiscordLogin = async () => {
    await AuthService.signInWithDiscord();
  };

  const handleJoinAsGuest = async () => {
    if (!username.trim()) return;
    const guestUser = await AuthService.createGuestUser(username.trim());
    setAuthUser(guestUser);
    const newPlayer: Player = {
      id: guestUser.id,
      username: guestUser.username,
      competitor_elo: guestUser.competitor_elo,
      spectator_elo: guestUser.spectator_elo,
      wins: 0,
      losses: 0,
      correct_votes: 0,
      coins: 100,
      role: 'Guest'
    };
    setCurrentPlayer(newPlayer);
    setIsJoining(false);
  };

  const handleGameEnd = (winner: Player) => {
    console.log(`Game ended! Winner: ${winner.username}`);
    setGameMode('menu');
  };
  
  const handleSetPlayer = (user: AuthUser) => {
    const player: Player = {
      id: user.id,
      username: user.username,
      competitor_elo: user.competitor_elo,
      spectator_elo: user.spectator_elo,
      wins: user.games_won,
      losses: user.games_played - user.games_won,
      correct_votes: user.total_votes_received,
      coins: user.coins,
      role: user.competitor_elo >= 1200 ? 'Gold II' : 'Silver III'
    };
    setCurrentPlayer(player);
  }

  if (gameMode === 'single' && currentPlayer) {
    return <SinglePlayerMode currentPlayer={currentPlayer} onGameEnd={handleGameEnd} />;
  }
  
  if (gameMode === 'multi' && currentPlayer) {
    return <GameBoard currentPlayer={currentPlayer} onGameEnd={handleGameEnd} />;
  }

  if (authUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              Sound Royale
            </h1>
            
            <div className="bg-slate-800/50 border border-green-500/30 rounded-xl p-8 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-green-400">Connected!</h2>
                  <p className="text-slate-300 text-lg">{authUser.discord_username || authUser.username}</p>
                  {authUser.discord_id && (
                    <p className="text-xs text-slate-500">Discord Profile Linked</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <span className="text-orange-400 font-medium">Competitor</span>
                  <div className="text-2xl font-bold text-white">{authUser.competitor_elo}</div>
                  <div className="text-xs text-slate-400">ELO Rating</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <span className="text-blue-400 font-medium">Spectator</span>
                  <div className="text-2xl font-bold text-white">{authUser.spectator_elo}</div>
                  <div className="text-xs text-slate-400">ELO Rating</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <span className="text-yellow-400 font-medium">Coins</span>
                  <div className="text-2xl font-bold text-white">{authUser.coins}</div>
                  <div className="text-xs text-slate-400">Currency</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3">
                  <span className="text-green-400 font-medium">Record</span>
                  <div className="text-2xl font-bold text-white">{authUser.games_won}W</div>
                  <div className="text-xs text-slate-400">{authUser.games_played - authUser.games_won}L</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => { handleSetPlayer(authUser); setGameMode('single'); }}
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 text-xl rounded-xl shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <Gamepad2 className="w-6 h-6 mr-2" />
                  Practice Mode (AI)
                </Button>
                
                <Button
                  onClick={() => { handleSetPlayer(authUser); setGameMode('multi'); }}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 text-xl rounded-xl shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <Gamepad2 className="w-6 h-6 mr-2" />
                  Multiplayer Arena
                </Button>
              </div>
              
              <Button
                onClick={async () => {
                  await AuthService.signOut();
                  setAuthUser(null);
                  setCurrentPlayer(null);
                }}
                variant="outline"
                size="sm"
                className="w-full mt-3 border-slate-600 text-slate-400 hover:bg-slate-700"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isJoining) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/80 border border-purple-500/30 rounded-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-cyan-400 mb-6 text-center">Join as Guest</h2>
          <div className="space-y-4">
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username..."
              className="bg-slate-700 border-slate-600 text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleJoinAsGuest()}
            />
            <div className="flex gap-3">
              <Button onClick={handleJoinAsGuest} disabled={!username.trim()} className="flex-1 bg-purple-600">Join</Button>
              <Button onClick={() => setIsJoining(false)} variant="outline">Back</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              Sound Royale
            </h1>
            <p className="text-2xl text-slate-300 font-medium">
              Discord-Integrated Music Genre Battle Royale
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleDiscordLogin}
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-12 py-6 text-xl rounded-xl shadow-2xl"
              >
                <LogIn className="w-6 h-6 mr-2" />
                Connect Discord
              </Button>
              <Button
                onClick={() => navigate('/signup')}
                size="lg"
                variant="outline"
                className="border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white font-bold px-12 py-6 text-xl rounded-xl"
              >
                <Mail className="w-6 h-6 mr-2" />
                Sign up with Email
              </Button>
            </div>
            <Button
                onClick={() => setIsJoining(true)}
                size="lg"
                variant="link"
                className="text-slate-400"
              >
                ...or play as a guest
              </Button>
          </div>
        </div>
      </div>
    );
};

export default Index;
