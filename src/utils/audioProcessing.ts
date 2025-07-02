
// Audio processing utilities for Sound Royale

export interface AudioAnalysis {
  tempo: number;
  key: string;
  energy: number;
  danceability: number;
  loudness: number;
}

export interface AudioValidation {
  isValid: boolean;
  duration: number;
  format: string;
  errors: string[];
}

// Basic audio validation
export const validateAudioFile = async (file: File): Promise<AudioValidation> => {
  const errors: string[] = [];
  
  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    errors.push('File size must be less than 10MB');
  }
  
  // Check file type
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Only MP3, WAV, MP4, and M4A files are allowed');
  }
  
  // Get audio duration
  let duration = 0;
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    duration = audioBuffer.duration;
    
    // Check duration (must be between 30 seconds and 5 minutes for battles)
    if (duration < 30) {
      errors.push('Audio must be at least 30 seconds long');
    }
    if (duration > 300) {
      errors.push('Audio must be no longer than 5 minutes');
    }
    
    audioContext.close();
  } catch (error) {
    errors.push('Could not decode audio file');
  }
  
  return {
    isValid: errors.length === 0,
    duration,
    format: file.type,
    errors
  };
};

// Basic audio analysis (simplified version)
export const analyzeAudio = async (file: File): Promise<AudioAnalysis> => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Get audio data for analysis
    const channelData = audioBuffer.getChannelData(0);
    
    // Calculate basic metrics
    const analysis = performBasicAnalysis(channelData, audioBuffer.sampleRate);
    
    audioContext.close();
    return analysis;
  } catch (error) {
    console.error('Audio analysis failed:', error);
    // Return default values if analysis fails
    return {
      tempo: 120,
      key: 'C',
      energy: 0.5,
      danceability: 0.5,
      loudness: -10
    };
  }
};

// Simplified audio analysis calculations
const performBasicAnalysis = (channelData: Float32Array, sampleRate: number): AudioAnalysis => {
  // Calculate RMS energy
  let sumSquares = 0;
  for (let i = 0; i < channelData.length; i++) {
    sumSquares += channelData[i] * channelData[i];
  }
  const rms = Math.sqrt(sumSquares / channelData.length);
  const energy = Math.min(rms * 2, 1); // Normalize to 0-1
  
  // Calculate loudness (simplified)
  const loudness = 20 * Math.log10(rms) || -60; // dB
  
  // Basic tempo detection (very simplified - counts zero crossings)
  let zeroCrossings = 0;
  for (let i = 1; i < channelData.length; i++) {
    if ((channelData[i-1] >= 0) !== (channelData[i] >= 0)) {
      zeroCrossings++;
    }
  }
  
  // Rough tempo estimation based on zero crossings
  const tempo = Math.min(Math.max((zeroCrossings / channelData.length) * sampleRate / 100, 60), 200);
  
  // Mock key detection (would need FFT for real implementation)
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const key = keys[Math.floor(Math.random() * keys.length)];
  
  // Danceability based on energy and tempo
  const danceability = Math.min((energy * 0.7) + ((tempo - 60) / 140 * 0.3), 1);
  
  return {
    tempo: Math.round(tempo),
    key,
    energy: Math.round(energy * 100) / 100,
    danceability: Math.round(danceability * 100) / 100,
    loudness: Math.round(loudness * 10) / 10
  };
};

// Convert file to format suitable for storage/streaming
export const processAudioForStorage = async (file: File): Promise<Blob> => {
  // For now, just return the original file
  // In a real implementation, you might want to:
  // - Normalize audio levels
  // - Convert to a standard format (MP3)
  // - Apply compression
  
  return file;
};

export default {
  validateAudioFile,
  analyzeAudio,
  processAudioForStorage
};
