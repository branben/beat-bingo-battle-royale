
import {
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
} from '@/lib/audio-storage';

export const MIN_DURATION_SECONDS = 30;
export const MAX_DURATION_SECONDS = 300; // 5 minutes

export interface AudioValidationResult {
  isValid: boolean;
  error?: string;
  duration?: number;
}

/**
 * Extracts the duration of an audio file in seconds.
 * @param file The audio file.
 * @returns A promise that resolves with the duration in seconds.
 */
export const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) {
        return reject(new Error('Failed to read file.'));
      }
      audioContext.decodeAudioData(e.target.result as ArrayBuffer, 
        (buffer) => {
          resolve(buffer.duration);
        },
        (error) => {
          reject(new Error(`Could not decode audio data: ${error.message}`));
        }
      );
    };

    reader.onerror = () => {
      reject(new Error('FileReader error.'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Validates an audio file based on type, size, and duration.
 * @param file The audio file to validate.
 * @returns A promise that resolves with a validation result object.
 */
export const validateAudioFile = async (file: File): Promise<AudioValidationResult> => {
  // Check file type
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!ALLOWED_MIME_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return { isValid: false, error: 'Please upload an MP3 or WAV file.' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: 'File size must be less than 10MB.' };
  }

  // Check duration
  try {
    const duration = await getAudioDuration(file);
    if (duration < MIN_DURATION_SECONDS) {
      return { isValid: false, error: `Audio must be at least ${MIN_DURATION_SECONDS} seconds long.`, duration };
    }
    if (duration > MAX_DURATION_SECONDS) {
      return { isValid: false, error: `Audio must be no longer than ${MAX_DURATION_SECONDS / 60} minutes.`, duration };
    }
    return { isValid: true, duration };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Could not process audio file.';
    return { isValid: false, error: `Duration check failed: ${errorMessage}` };
  }
};
