
import React from 'react';
import { BingoCard as BingoCardType } from '@/types/game';
import { cn } from '@/lib/utils';

interface BingoCardProps {
  card: BingoCardType;
  onSquareClick: (row: number, col: number) => void;
  isClickable: boolean;
  playerName: string;
  isBlinded?: boolean;
}

const BingoCard: React.FC<BingoCardProps> = ({ 
  card, 
  onSquareClick, 
  isClickable, 
  playerName,
  isBlinded = false 
}) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <h3 className="text-xl font-bold text-cyan-400">{playerName}</h3>
      <div className={cn(
        "grid grid-cols-5 gap-1 p-4 rounded-lg border-2 border-purple-500/30 bg-slate-800/50",
        isBlinded && "blur-sm opacity-50"
      )}>
        {card.squares.map((row, rowIndex) =>
          row.map((square, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => isClickable && onSquareClick(rowIndex, colIndex)}
              disabled={!isClickable || isBlinded}
              className={cn(
                "w-16 h-16 md:w-20 md:h-20 text-xs md:text-sm font-medium rounded-lg border transition-all duration-200",
                "hover:scale-105 hover:shadow-lg",
                card.marked[rowIndex][colIndex]
                  ? "bg-gradient-to-br from-purple-600 to-pink-600 border-purple-400 text-white shadow-purple-500/50 shadow-lg"
                  : "bg-slate-700/80 border-slate-600 text-slate-200 hover:bg-slate-600/80 hover:border-cyan-400/50",
                square === 'FREE' && "bg-gradient-to-br from-cyan-600 to-blue-600 border-cyan-400",
                !isClickable && "cursor-not-allowed opacity-60"
              )}
              aria-label={`Bingo square ${square}`}
            >
              {square}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default BingoCard;
