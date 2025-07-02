import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Trophy, Clock, Target, TrendingUp, Zap, Users, Music, Award } from 'lucide-react';
import { GameState } from '@/types/game';

interface GameAnalyticsProps {
  gameState: GameState;
  gameDuration: number; // in seconds
  totalVotes: number;
  roundDetails: Array<{
    round: number;
    genre: string;
    winner: string;
    votingMargin: number; // percentage
    timeTaken: number; // seconds to complete round
  }>;
}

export const GameAnalytics = ({ gameState, gameDuration, totalVotes, roundDetails }: GameAnalyticsProps) => {
  const winner = gameState.winner_id === gameState.player1.id ? gameState.player1 : gameState.player2;
  const loser = gameState.winner_id === gameState.player1.id ? gameState.player2 : gameState.player1;
  
  // Calculate detailed analytics
  const totalRounds = roundDetails.length;
  const averageRoundTime = roundDetails.reduce((sum, round) => sum + round.timeTaken, 0) / totalRounds;
  const winnerDominance = roundDetails.filter(round => round.winner === winner.username).length / totalRounds * 100;
  const closestRound = roundDetails.reduce((closest, round) => 
    Math.abs(50 - round.votingMargin) < Math.abs(50 - closest.votingMargin) ? round : closest
  );
  const decisiveRound = roundDetails.reduce((decisive, round) => 
    Math.abs(50 - round.votingMargin) > Math.abs(50 - decisive.votingMargin) ? round : decisive
  );
  
  // Performance metrics
  const winnerGenres = roundDetails.filter(round => round.winner === winner.username).map(r => r.genre);
  const loserGenres = roundDetails.filter(round => round.winner === loser.username).map(r => r.genre);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Game Analytics
          </h2>
          <Trophy className="w-8 h-8 text-yellow-400" />
        </div>
        <p className="text-slate-400">Deep dive into the battle performance</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{formatTime(gameDuration)}</div>
            <div className="text-sm text-slate-400">Total Duration</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{totalRounds}</div>
            <div className="text-sm text-slate-400">Rounds Played</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{totalVotes}</div>
            <div className="text-sm text-slate-400">Total Votes</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{formatTime(Math.round(averageRoundTime))}</div>
            <div className="text-sm text-slate-400">Avg Round Time</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Player Performance */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Performance Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{winner.username} Dominance</span>
                <span className="text-sm text-slate-400">{winnerDominance.toFixed(1)}%</span>
              </div>
              <Progress value={winnerDominance} className="h-2" />
            </div>
            
            <Separator className="bg-slate-700" />
            
            <div className="space-y-2">
              <h4 className="font-medium text-slate-200">Round Winners</h4>
              {roundDetails.map((round, index) => (
                <div key={index} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">R{round.round}</Badge>
                    <span className="text-sm">{round.genre}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{round.winner}</span>
                    <span className="text-xs text-slate-400">({round.votingMargin.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Genre Analysis */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-400" />
              Genre Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-slate-200 mb-3">{winner.username}'s Winning Genres</h4>
              <div className="flex flex-wrap gap-2">
                {winnerGenres.map((genre, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-700/50 text-green-200">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
            
            {loserGenres.length > 0 && (
              <>
                <Separator className="bg-slate-700" />
                <div>
                  <h4 className="font-medium text-slate-200 mb-3">{loser.username}'s Winning Genres</h4>
                  <div className="flex flex-wrap gap-2">
                    {loserGenres.map((genre, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-700/50 text-blue-200">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Highlight Moments */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Highlight Moments
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-cyan-400">🔥 Most Decisive Round</h4>
            <div className="bg-slate-900/50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-purple-600">{decisiveRound.genre}</Badge>
                <span className="text-sm text-slate-400">Round {decisiveRound.round}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">{decisiveRound.winner}</span> won with{' '}
                <span className="text-yellow-400 font-bold">{decisiveRound.votingMargin.toFixed(1)}%</span> of votes
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-orange-400">⚡ Closest Battle</h4>
            <div className="bg-slate-900/50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-orange-600">{closestRound.genre}</Badge>
                <span className="text-sm text-slate-400">Round {closestRound.round}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">{closestRound.winner}</span> barely won with{' '}
                <span className="text-orange-400 font-bold">{closestRound.votingMargin.toFixed(1)}%</span> of votes
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ELO Changes */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            ELO Rating Changes
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="text-center space-y-2">
            <div className="text-lg font-medium text-slate-200">{winner.username}</div>
            <div className="text-3xl font-bold text-green-400">+24 ELO</div>
            <div className="text-sm text-slate-400">{winner.competitor_elo} → {winner.competitor_elo + 24}</div>
            <div className="text-xs text-green-300">New rank: {winner.competitor_elo + 24 >= 1300 ? 'Gold II' : 'Silver III'}</div>
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-lg font-medium text-slate-200">{loser.username}</div>
            <div className="text-3xl font-bold text-red-400">-18 ELO</div>
            <div className="text-sm text-slate-400">{loser.competitor_elo} → {loser.competitor_elo - 18}</div>
            <div className="text-xs text-slate-400">Rank unchanged</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
