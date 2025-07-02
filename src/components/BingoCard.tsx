
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

  // Convert 5x5 to 3x3 by taking center 3x3 section
  const get3x3Grid = () => {
    if (!card.squares || card.squares.length < 5) return [];
    
    const grid3x3 = [];
    for (let i = 1; i <= 3; i++) {
      const row = [];
      for (let j = 1; j <= 3; j++) {
        row.push(card.squares[i][j]);
      }
      grid3x3.push(row);
    }
    return grid3x3;
  };

  const squares3x3 = get3x3Grid();

  return (
    <div className="relative">
      {/* Glassmorphic card container */}
      <div className="relative bg-gradient-to-br from-slate-800/30 via-slate-900/40 to-slate-800/30 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-6 shadow-2xl">
        {/* Animated border glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-2xl opacity-50 animate-pulse"></div>
        
        {/* Inner glassmorphic layer */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">
                  {playerName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  {playerName}
                </h3>
                <div className="flex items-center gap-2">
                  {isCurrentPlayer && (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                      You
                    </Badge>
                  )}
                  {isBlinded && (
                    <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs">
                      Blinded
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3x3 Bingo Grid */}
          <div className="grid grid-cols-3 gap-3">
            {squares3x3.map((row, rowIndex) => (
              row.map((genre, colIndex) => {
                const isCalled = isGenreCalled(genre);
                const isWon = isGenreWon(genre);
                
                return (
                  <div key={`${rowIndex}-${colIndex}`} className="relative group">
                    <div className={`
                      relative rounded-2xl p-4 flex items-center justify-center text-sm font-medium
                      transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-1
                      backdrop-blur-sm border min-h-[80px]
                      ${isWon 
                        ? 'bg-gradient-to-br from-emerald-500/30 to-green-600/40 border-emerald-400/50 text-emerald-100 shadow-lg shadow-emerald-500/25' 
                        : isCalled 
                          ? 'bg-gradient-to-br from-blue-500/30 to-indigo-600/40 border-blue-400/50 text-blue-100 shadow-lg shadow-blue-500/25' 
                          : 'bg-gradient-to-br from-slate-700/50 to-slate-800/60 border-slate-500/30 text-slate-200 hover:border-purple-400/50 hover:bg-slate-700/60'
                      }
                      ${isBlinded ? 'opacity-20 blur-sm pointer-events-none' : ''}
                    `}>
                      {/* Glassmorphic inner shine */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Genre text */}
                      <span className="relative z-10 text-center leading-tight font-semibold">
                        {genre}
                      </span>
                      
                      {/* Win sparkle indicator */}
                      {isWon && (
                        <div className="absolute -top-2 -right-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                      
                      {/* Called check indicator */}
                      {isCalled && !isWon && (
                        <div className="absolute -top-1 -right-1">
                          <CheckCircle2 className="w-5 h-5 text-blue-400 drop-shadow-lg" />
                        </div>
                      )}
                      
                      {/* Special effects for center square (if it's the FREE space equivalent) */}
                      {rowIndex === 1 && colIndex === 1 && (
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-pulse" />
                      )}
                    </div>
                    
                    {/* Animated glow ring for won genres */}
                    {isWon && (
                      <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400/60 animate-pulse shadow-lg shadow-emerald-400/30" />
                    )}
                    
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-blue-500/0 to-cyan-500/0 group-hover:from-purple-500/10 group-hover:via-blue-500/10 group-hover:to-cyan-500/10 transition-all duration-300 pointer-events-none" />
                  </div>
                );
              })
            ))}
          </div>

          {/* Card stats footer */}
          <div className="mt-6 flex justify-between items-center text-xs text-slate-400">
            <span>{calledGenres.length} genres called</span>
            <span>{wonGenres.length} bingos</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BingoCard;
