import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AudioPlayer } from '@/components/AudioPlayer';

// Mock HTMLAudioElement
Object.defineProperty(window, 'HTMLAudioElement', {
  value: vi.fn().mockImplementation(() => ({
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    currentTime: 0,
    duration: 120, // 2 minutes
    volume: 1,
    muted: false,
    src: '',
  })),
});

describe('AudioPlayer Component', () => {
  const mockAudioUrl = 'https://test.com/audio.mp3';

  it('should render audio player with controls', () => {
    render(<AudioPlayer audioUrl={mockAudioUrl} />);
    
    // Check for play button (should show Play icon initially)
    expect(screen.getByRole('button')).toBeInTheDocument();
    
    // Check for progress bar
    expect(screen.getByText('0:00')).toBeInTheDocument();
  });

  it('should show player name when provided', () => {
    render(<AudioPlayer audioUrl={mockAudioUrl} playerName="TestPlayer" />);
    
    expect(screen.getByText("TestPlayer's Beat")).toBeInTheDocument();
  });

  it('should have volume controls', () => {
    render(<AudioPlayer audioUrl={mockAudioUrl} />);
    
    // Check for volume slider
    const volumeSlider = screen.getByRole('slider');
    expect(volumeSlider).toBeInTheDocument();
    expect(volumeSlider).toHaveAttribute('min', '0');
    expect(volumeSlider).toHaveAttribute('max', '1');
  });

  it('should toggle play/pause when button is clicked', () => {
    const mockAudio = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      currentTime: 0,
      duration: 120,
      volume: 1,
      muted: false,
      src: '',
    };

    // Mock the useRef to return our mock audio element
    vi.spyOn(React, 'useRef').mockReturnValue({ current: mockAudio });

    render(<AudioPlayer audioUrl={mockAudioUrl} />);
    
    const playButton = screen.getByRole('button');
    fireEvent.click(playButton);
    
    expect(mockAudio.play).toHaveBeenCalled();
  });

  it('should handle audio loading states', () => {
    render(<AudioPlayer audioUrl={mockAudioUrl} />);
    
    // Initially should show loading state or be ready to play
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should format time correctly', () => {
    render(<AudioPlayer audioUrl={mockAudioUrl} />);
    
    // Should show 0:00 initially
    expect(screen.getByText('0:00')).toBeInTheDocument();
  });
});
