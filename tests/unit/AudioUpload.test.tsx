import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AudioUpload } from '@/components/AudioUpload';
import * as AudioStorageService from '@/lib/audio-storage';
import * as audioProcessing from '@/utils/audioProcessing';
import { Toaster } from '@/components/ui/toaster';

// Mock dependencies
vi.mock('@/lib/audio-storage');
vi.mock('@/utils/audioProcessing');

// Mock the useToast hook used by the AudioUpload component
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the entire Toaster component
vi.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster-mock" />,
}));

const mockUploadAudio = vi.spyOn(AudioStorageService.AudioStorageService, 'uploadAudio');
const mockValidateAudioFile = vi.spyOn(audioProcessing, 'validateAudioFile');

describe('AudioUpload', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const renderComponent = () => {
    const onUploadComplete = vi.fn();
    render(
      <>
        <AudioUpload onUploadComplete={onUploadComplete} gameId="test-game" />
        <Toaster />
      </>
    );
    return { onUploadComplete };
  };

  const selectFile = (file: File) => {
    const input = screen.getByLabelText('Upload Beat');
    fireEvent.change(input, { target: { files: [file] } });
  };

  it('renders the initial drag and drop state', () => {
    renderComponent();
    expect(screen.getByText('Drag & drop or click to upload')).toBeInTheDocument();
  });

  it('handles successful file upload', async () => {
    renderComponent();
    const file = new File(['(��□_□)'], 'test.mp3', { type: 'audio/mpeg' });

    mockValidateAudioFile.mockResolvedValue({ isValid: true, duration: 180 });
    mockUploadAudio.mockResolvedValue({ 
      publicUrl: 'http://fake.url/test.mp3', 
      path: 'test/test.mp3',
      duration: 180 
    });

    selectFile(file);
    
    await waitFor(() => {
      expect(screen.getByText('test.mp3')).toBeInTheDocument();
      expect(screen.getByText('Duration: 3:00')).toBeInTheDocument();
    });
  });

  it('shows an error for invalid file type', async () => {
    renderComponent();
    const file = new File(['(⌐□_□)'], 'test.txt', { type: 'text/plain' });
    
    // This mock isn't strictly necessary for this test path, as react-dropzone rejects the file type before this is called.
    mockValidateAudioFile.mockResolvedValue({ isValid: false, error: 'Please upload an MP3 or WAV file.' });

    selectFile(file);

    await waitFor(() => {
      // This error message comes directly from the react-dropzone library's file type validation.
      expect(screen.getByText(/File type must be one of/i)).toBeInTheDocument();
    });
  });

  it('shows an error for files that are too short', async () => {
    renderComponent();
    const file = new File(['(⌐□_□)'], 'short.mp3', { type: 'audio/mpeg' });

    mockValidateAudioFile.mockResolvedValue({ isValid: false, error: 'Audio must be at least 30 seconds long.' });

    selectFile(file);

    await waitFor(() => {
      expect(screen.getByText(/Audio must be at least 30 seconds long/i)).toBeInTheDocument();
    });
  });
});