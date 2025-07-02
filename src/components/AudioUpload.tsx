
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, Music, AlertCircle, FileCheck, XCircle } from 'lucide-react';
import { AudioStorageService } from '@/lib/audio-storage';
import { useToast } from '@/hooks/use-toast';
import { validateAudioFile } from '@/utils/audioProcessing';
import { cn } from '@/lib/utils';

interface AudioUploadProps {
  onUploadComplete: (result: { publicUrl: string; duration: number; fileName: string }) => void;
  disabled?: boolean;
  gameId?: string;
}

export const AudioUpload: React.FC<AudioUploadProps> = ({ 
  onUploadComplete, 
  disabled = false,
  gameId 
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; duration: number } | null>(null);
  const { toast } = useToast();

  const handleUpload = async (file: File) => {
    setError(null);
    setUploading(true);
    setUploadProgress(0);
    setFileInfo(null);

    try {
      // We now pass the onProgress callback to the upload service
      const result = await AudioStorageService.uploadAudio(
        file,
        gameId,
        (progress) => {
          setUploadProgress(progress);
        }
      );
      
      setUploadProgress(100);
      setFileInfo({ name: file.name, duration: result.duration });

      toast({
        title: "Upload Successful!",
        description: "Your beat is ready.",
      });

      onUploadComplete({
        publicUrl: result.publicUrl,
        duration: result.duration,
        fileName: file.name,
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: any[]) => {
    setError(null);

    if (fileRejections.length > 0) {
      const message = fileRejections[0].errors[0].message;
      setError(message);
      toast({ title: "Invalid File", description: message, variant: "destructive" });
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const validation = await validateAudioFile(file);
      if (!validation.isValid) {
        const errorMessage = validation.errors.length > 0 ? validation.errors[0] : 'Invalid file.';
        setError(errorMessage);
        toast({ title: "Validation Failed", description: errorMessage, variant: "destructive" });
      } else {
        await handleUpload(file);
      }
    }
  }, [gameId, onUploadComplete, toast]);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: { 'audio/mpeg': ['.mp3'], 'audio/wav': ['.wav'] },
    maxFiles: 1,
    multiple: false,
    disabled: disabled || uploading,
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 cursor-pointer",
          "border-slate-600 bg-slate-800/50 hover:border-purple-500 hover:bg-slate-800",
          isDragActive && "border-purple-600",
          isDragAccept && "border-green-500 bg-green-900/50",
          isDragReject && "border-red-500 bg-red-900/50",
          (disabled || uploading) && "cursor-not-allowed opacity-50"
        )}
      >
        <input {...getInputProps()} aria-label="Upload Beat" />
        
        {uploading ? (
          <div className="space-y-4">
            <Music className="mx-auto h-12 w-12 text-purple-400 animate-pulse" />
            <p className="text-lg font-semibold text-white">Uploading...</p>
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-slate-400">{uploadProgress.toFixed(0)}%</p>
          </div>
        ) : fileInfo ? (
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <FileCheck className="h-10 w-10 text-green-400" />
              <div>
                <p className="font-semibold text-white truncate">{fileInfo.name}</p>
                <p className="text-sm text-slate-300">Duration: {formatDuration(fileInfo.duration)}</p>
              </div>
            </div>
            <Button onClick={() => setFileInfo(null)} variant="outline" size="sm" className="w-full">
              <XCircle className="mr-2 h-4 w-4" />
              Upload another file
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-slate-400" />
            <p className="text-lg font-semibold text-white">
              {isDragActive ? "Drop your beat here!" : "Drag & drop or click to upload"}
            </p>
            <p className="text-sm text-slate-400">MP3 or WAV, 30s-5min, max 10MB</p>
          </div>
        )}
      </div>

      {error && !uploading && (
        <div className="mt-3 flex items-center gap-2 text-red-400 text-sm animate-shake">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
