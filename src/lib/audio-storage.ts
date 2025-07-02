
import { supabase } from '@/integrations/supabase/client';
import { validateAudioFile } from '@/utils/audioProcessing';

export const AUDIO_BUCKET = 'audio-files';
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME_TYPES = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
export const ALLOWED_EXTENSIONS = ['.mp3', '.wav'];

export interface AudioUploadResult {
  publicUrl: string;
  path: string;
  duration: number;
}

export class AudioStorageService {
  
  static generateFileName(originalName: string): string {
    const fileExt = originalName.split('.').pop();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    return `${timestamp}-${randomId}.${fileExt}`;
  }

  /**
   * Uploads an audio file to storage
   */
  static async uploadAudio(
    file: File, 
    gameId?: string, 
    onProgress?: (percentage: number) => void,
    signal?: AbortSignal
  ): Promise<AudioUploadResult> {
    // Validate file first
    const validationResult = await validateAudioFile(file);
    if (!validationResult.isValid) {
      const errorMessage = validationResult.errors.length > 0 ? validationResult.errors[0] : 'Invalid file';
      throw new Error(errorMessage);
    }

    // Check if the operation was aborted
    if (signal?.aborted) {
      throw new DOMException('Upload was aborted', 'AbortError');
    }

    // Generate unique filename
    const fileName = this.generateFileName(file.name);
    const folder = gameId ? `matches/${gameId}` : 'submissions';
    const filePath = `${folder}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Call progress callback if provided
    if (onProgress) {
      onProgress(100);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(AUDIO_BUCKET)
      .getPublicUrl(filePath);

    return {
      publicUrl,
      path: filePath,
      duration: validationResult.duration || 0,
    };
  }

  /**
   * Deletes an audio file from storage
   */
  static async deleteAudio(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .remove([path]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Gets the public URL for an audio file
   */
  static getAudioUrl(path: string): string {
    const { data: { publicUrl } } = supabase.storage
      .from(AUDIO_BUCKET)
      .getPublicUrl(path);

    return publicUrl;
  }
}
