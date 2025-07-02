
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Player } from "@/types/game";
import GameBoard from "@/components/GameBoard";
import SinglePlayerMode from "@/components/SinglePlayerMode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Users, Trophy, Sparkles } from "lucide-react";

const Index = () => {
  const [gameMode, setGameMode] = useState<'menu' | 'single' | 'multiplayer'>('menu');
  const { toast } = useToast();

  // Mock current player - in real app this would come from auth
  const currentPlayer: Player = {
    id: 'current-user',
    username: 'You',
    competitor_elo: 1100,
    spectator_elo: 1200,
    wins: 8,
    losses: 5,
    correct_votes: 28,
    coins: 175,
    role: 'Silver III'
  };

  const handleGameEnd = (winner: Player) => {
    toast({
      title: "🎉 Game Complete!",
      description: `${winner.username} wins! ${winner.id === currentPlayer.id ? 'Congratulations!' : 'Better luck next time!'}`,
    });
    
    // Return to menu after 3 seconds
    setTimeout(() => {
      setGameMode('menu');
    }, 3000);
  };

  if (gameMode === 'single') {
    return <SinglePlayerMode currentPlayer={currentPlayer} onGameEnd={handleGameEnd} />;
  }

  if (gameMode === 'multiplayer') {
    return <GameBoard currentPlayer={currentPlayer} onGameEnd={handleGameEnd} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-4xl mx-auto">
        <div className="space-y-4">
          <h1 className="text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent animate-pulse">
            Sound Royale
          </h1>
          <p className="text-2xl text-slate-300 font-medium">
            The ultimate music production battle arena
          </p>
        </div>

        {/* Player Stats Card */}
        <Card className="bg-slate-800/50 border-purple-500/30 max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {currentPlayer.username.charAt(0).toUpperCase()}
                </span>
              </div>
              {currentPlayer.username}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <Trophy className="w-5 h-5 mx-auto mb-1 text-orange-400" />
              <div className="text-orange-400 font-medium">ELO</div>
              <div className="text-xl font-bold text-white">{currentPlayer.competitor_elo}</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <Users className="w-5 h-5 mx-auto mb-1 text-blue-400" />
              <div className="text-blue-400 font-medium">W/L</div>
              <div className="text-xl font-bold text-white">{currentPlayer.wins}/{currentPlayer.losses}</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <Sparkles className="w-5 h-5 mx-auto mb-1 text-green-400" />
              <div className="text-green-400 font-medium">Votes</div>
              <div className="text-xl font-bold text-white">{currentPlayer.correct_votes}</div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 text-center">
              <Sparkles className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
              <div className="text-yellow-400 font-medium">Coins</div>
              <div className="text-xl font-bold text-white">{currentPlayer.coins}</div>
            </div>
          </CardContent>
        </Card>

        {/* Game Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Button
            onClick={() => setGameMode('single')}
            size="lg"
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold p-8 h-auto flex flex-col gap-4 rounded-xl shadow-xl hover:scale-105 transition-all duration-300"
          >
            <Gamepad2 className="w-12 h-12" />
            <div>
              <div className="text-xl font-bold">Practice Mode</div>
              <div className="text-sm opacity-90">Battle against AI</div>
            </div>
          </Button>

          <Button
            onClick={() => setGameMode('multiplayer')}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold p-8 h-auto flex flex-col gap-4 rounded-xl shadow-xl hover:scale-105 transition-all duration-300"
          >
            <Users className="w-12 h-12" />
            <div>
              <div className="text-xl font-bold">Multiplayer</div>
              <div className="text-sm opacity-90">Battle real players</div>
            </div>
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Real-time genre challenges</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>ELO ranking system</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Spectator voting</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
