
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, Clock, CheckCircle, Music } from 'lucide-react';
import { Player } from '@/types/game';
import { toast } from '@/hooks/use-toast';

interface ProductionPhaseProps {
  player1: Player;
  player2: Player;
  currentGenre: string;
  timeRemaining: number;
  onBeatUpload: (playerId: string, audioFile: File) => void;
  onReadyToggle: (playerId: string, isReady: boolean) => void;
  player1Ready: boolean;
  player2Ready: boolean;
  currentPlayer: Player;
}

const ProductionPhase: React.FC<ProductionPhaseProps> = ({
  player1,
  player2,
  currentGenre,
  timeRemaining,
  onBeatUpload,
  onReadyToggle,
  player1Ready,
  player2Ready,
  currentPlayer
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const isCurrentPlayerCompeting = currentPlayer.id === player1.id || currentPlayer.id === player2.id;
  const isCurrentPlayerReady = currentPlayer.id === player1.id ? player1Ready : player2Ready;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate audio file
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an audio file (MP3, WAV, etc.)",
          variant: "destructive"
        });
        return;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }
      
      setUploadedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile || !isCurrentPlayerCompeting) return;
    
    setIsUploading(true);
    try {
      await onBeatUpload(currentPlayer.id, uploadedFile);
      toast({
        title: "Beat Uploaded!",
        description: "Your beat has been successfully uploaded.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your beat. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleReadyToggle = () => {
    if (!isCurrentPlayerCompeting) return;
    onReadyToggle(currentPlayer.id, !isCurrentPlayerReady);
  };

  const progressPercentage = ((30 * 60 - timeRemaining) / (30 * 60)) * 100;

  return (
    <div className="space-y-6">
      {/* Timer and Genre Display */}
      <Card className="bg-slate-800/50 border-purple-500/30">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl text-cyan-400">
            <Music className="w-6 h-6" />
            Production Phase: {currentGenre}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Clock className="w-8 h-8 text-purple-400" />
              {formatTime(timeRemaining)}
            </div>
            <Progress value={progressPercentage} className="w-full h-3" />
            <p className="text-slate-400 mt-2">Time remaining to create your beat</p>
          </div>
        </CardContent>
      </Card>

      {/* Producers Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-800/50 border-slate-600">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-cyan-400">{player1.username}</span>
              {player1Ready && (
                <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Ready
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">Producer 1</p>
            <p className="text-sm text-slate-400">ELO: {player1.competitor_elo}</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-600">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-pink-400">{player2.username}</span>
              {player2Ready && (
                <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Ready
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">Producer 2</p>
            <p className="text-sm text-slate-400">ELO: {player2.competitor_elo}</p>
          </CardContent>
        </Card>
      </div>

      {/* Upload Section (only for competing players) */}
      {isCurrentPlayerCompeting && (
        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-purple-400">Upload Your Beat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4">
              <Input
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                disabled={isCurrentPlayerReady}
                className="bg-slate-700 border-slate-600 text-white file:bg-purple-600 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2"
              />
              
              {uploadedFile && (
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Music className="w-4 h-4" />
                  {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)}MB)
                </div>
              )}
              
              <div className="flex gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={!uploadedFile || isUploading || isCurrentPlayerReady}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Beat'}
                </Button>
                
                <Button
                  onClick={handleReadyToggle}
                  disabled={!uploadedFile}
                  variant={isCurrentPlayerReady ? "destructive" : "default"}
                  className={isCurrentPlayerReady ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                >
                  {isCurrentPlayerReady ? 'Not Ready' : 'Mark Ready'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Spectator View */}
      {!isCurrentPlayerCompeting && (
        <Card className="bg-slate-800/50 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-400">Spectator View</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">
              Watch as {player1.username} and {player2.username} create their {currentGenre} beats!
            </p>
            <div className="space-y-2">
              <p className="text-sm text-slate-400">
                • Voting will begin when both producers mark themselves as ready
              </p>
              <p className="text-sm text-slate-400">
                • You'll have 15 minutes to vote for the better beat
              </p>
              <p className="text-sm text-slate-400">
                • Your vote power: {(1.0 + (currentPlayer.spectator_elo / 1000)).toFixed(1)}x
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductionPhase;
