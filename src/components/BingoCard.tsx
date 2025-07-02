
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { BingoCard as BingoCardType } from '@/types/game';

interface BingoCardProps {
  card: BingoCardType;
  calledGenres: string[];
  isBlinded: boolean;
  playerName: string;
  wonGenres?: string[]; // Genres this player specifically won
  isCurrentPlayer?: boolean;
}

const BingoCard: React.FC<BingoCardProps> = ({ 
  card, 
  calledGenres, 
  isBlinded, 
  playerName,
  wonGenres = [],
  isCurrentPlayer = false
}) => {
  const isGenreCalled = (genre: string) => calledGenres.includes(genre);
  const isGenreWon = (genre: string) => wonGenres.includes(genre);

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-900/40 via-purple-900/20 to-slate-900/40 backdrop-blur-xl">
      {/* Glassmorphic overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none" />
      
      {/* Animated border */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 p-[1px]">
        <div className="h-full w-full rounded-lg bg-slate-900/50 backdrop-blur-sm" />
      </div>

      <CardHeader className="relative z-10">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {playerName.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {playerName}'s Board
          </span>
          {isBlinded && (
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
              Blinded
            </Badge>
          )}
          {isCurrentPlayer && (
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              You
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 relative z-10">
        <div className="grid grid-cols-5 gap-2">
          {card.squares.map((row, rowIndex) => (
            row.map((genre, colIndex) => {
              const isCalled = isGenreCalled(genre);
              const isWon = isGenreWon(genre);
              
              return (
                <div key={`${rowIndex}-${colIndex}`} className="relative group">
                  <div className={`
                    relative rounded-lg p-3 flex items-center justify-center text-xs font-medium
                    transition-all duration-300 ease-out transform hover:scale-105
                    backdrop-blur-sm border
                    ${isWon 
                      ? 'bg-gradient-to-br from-green-500/30 to-emerald-600/30 border-green-400/50 text-green-100 shadow-lg shadow-green-500/25' 
                      : isCalled 
                        ? 'bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-blue-400/30 text-blue-100 shadow-md shadow-blue-500/20' 
                        : 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/30 text-slate-300 hover:border-purple-500/40'
                    }
                    ${isBlinded ? 'opacity-20 blur-sm' : ''}
                  `}>
                    {/* Glassmorphic inner glow */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <span className="relative z-10 text-center leading-tight">
                      {genre}
                    </span>
                    
                    {/* Win indicator */}
                    {isWon && (
                      <div className="absolute -top-1 -right-1">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                    
                    {/* Called indicator */}
                    {isCalled && !isWon && (
                      <CheckCircle2 className="absolute top-1 right-1 w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  
                  {/* Animated ring for won genres */}
                  {isWon && (
                    <div className="absolute inset-0 rounded-lg border-2 border-green-400/60 animate-pulse" />
                  )}
                </div>
              );
            })
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BingoCard;
