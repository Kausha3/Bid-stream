export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

export type VisualizerType = 'bars' | 'waveform' | 'circular';

export interface VisualizerSettings {
  type: VisualizerType;
  barCount: number;
  sensitivity: number;
  colorScheme: 'rainbow' | 'gradient' | 'solid';
}
