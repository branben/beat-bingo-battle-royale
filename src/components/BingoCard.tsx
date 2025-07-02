import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import { BingoCard as BingoCardType } from '@/types/game';

interface BingoCardProps {
  card: BingoCardType;
  calledGenres: string[];
  isBlinded: boolean;
  playerName: string;
}

const BingoCard: React.FC<BingoCardProps> = ({ card, calledGenres, isBlinded, playerName }) => {
  const isGenreCalled = (genre: string) => calledGenres.includes(genre);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {playerName}'s Bingo Card
          {isBlinded && <Badge className="ml-2">Blinded</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-5 gap-2">
          {card.squares.map((row, rowIndex) => (
            row.map((genre, colIndex) => (
              <div key={`${rowIndex}-${colIndex}`} className="relative">
                <div className={`
                  relative rounded-md p-3 flex items-center justify-center text-sm font-medium
                  ${isGenreCalled(genre) ? 'bg-green-700/80 text-white' : 'bg-slate-900/70 text-slate-300'}
                  ${isBlinded ? 'opacity-20' : ''}
                `}>
                  {genre}
                  {isGenreCalled(genre) && (
                    <CheckCircle2 className="absolute top-1 right-1 w-4 h-4 text-green-400" />
                  )}
                </div>
              </div>
            ))
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BingoCard;
