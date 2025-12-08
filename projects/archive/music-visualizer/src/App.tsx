import { useState, useRef, useCallback } from 'react';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import FrequencyBars from './components/FrequencyBars';
import WaveformVisualizer from './components/WaveformVisualizer';
import CircularVisualizer from './components/CircularVisualizer';
import Controls from './components/Controls';
import type { VisualizerSettings } from './types';
import './App.css';

function App() {
  const [hasAudio, setHasAudio] = useState(false);
  const [fileName, setFileName] = useState('');
  const [settings, setSettings] = useState<VisualizerSettings>({
    type: 'bars',
    barCount: 64,
    sensitivity: 1,
    colorScheme: 'rainbow'
  });

  const audioElementRef = useRef<HTMLAudioElement>(null);
  const {
    audioState,
    initializeAudio,
    getFrequencyData,
    getWaveformData,
    play,
    pause,
    seek,
    setVolume
  } = useAudioAnalyzer();

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && audioElementRef.current) {
      const url = URL.createObjectURL(file);
      audioElementRef.current.src = url;
      initializeAudio(audioElementRef.current);
      setHasAudio(true);
      setFileName(file.name);
    }
  }, [initializeAudio]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/') && audioElementRef.current) {
      const url = URL.createObjectURL(file);
      audioElementRef.current.src = url;
      initializeAudio(audioElementRef.current);
      setHasAudio(true);
      setFileName(file.name);
    }
  }, [initializeAudio]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const renderVisualizer = () => {
    switch (settings.type) {
      case 'bars':
        return (
          <FrequencyBars
            getFrequencyData={getFrequencyData}
            isPlaying={audioState.isPlaying}
            barCount={settings.barCount}
            colorScheme={settings.colorScheme}
          />
        );
      case 'waveform':
        return (
          <WaveformVisualizer
            getWaveformData={getWaveformData}
            isPlaying={audioState.isPlaying}
            colorScheme={settings.colorScheme}
          />
        );
      case 'circular':
        return (
          <CircularVisualizer
            getFrequencyData={getFrequencyData}
            isPlaying={audioState.isPlaying}
            barCount={settings.barCount}
            colorScheme={settings.colorScheme}
          />
        );
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Music Visualizer</h1>
        <p>Drop an audio file or click to upload</p>
      </header>

      <audio ref={audioElementRef} />

      <div className="visualizer-container">
        {hasAudio ? (
          <>
            <div className="now-playing">
              <span className="music-icon">🎵</span>
              <span className="track-name">{fileName}</span>
            </div>
            {renderVisualizer()}
            <Controls
              audioState={audioState}
              settings={settings}
              onSettingsChange={setSettings}
              onPlay={play}
              onPause={pause}
              onSeek={seek}
              onVolumeChange={setVolume}
            />
          </>
        ) : (
          <div
            className="upload-zone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="upload-content">
              <span className="upload-icon">🎧</span>
              <p>Drag & drop an audio file here</p>
              <span className="divider">or</span>
              <label className="upload-btn">
                Choose File
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  hidden
                />
              </label>
              <p className="supported">Supports MP3, WAV, OGG, etc.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
