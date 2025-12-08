import type { AudioState, VisualizerType, VisualizerSettings } from '../types';

interface ControlsProps {
  audioState: AudioState;
  settings: VisualizerSettings;
  onSettingsChange: (settings: VisualizerSettings) => void;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const Controls = ({
  audioState,
  settings,
  onSettingsChange,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange
}: ControlsProps) => {
  const visualizerTypes: VisualizerType[] = ['bars', 'waveform', 'circular'];
  const colorSchemes: Array<'rainbow' | 'gradient' | 'solid'> = ['rainbow', 'gradient', 'solid'];

  return (
    <div className="controls">
      <div className="playback-controls">
        <button className="play-btn" onClick={audioState.isPlaying ? onPause : onPlay}>
          {audioState.isPlaying ? '⏸' : '▶'}
        </button>

        <div className="progress-container">
          <span className="time">{formatTime(audioState.currentTime)}</span>
          <input
            type="range"
            className="progress-bar"
            min={0}
            max={audioState.duration || 100}
            value={audioState.currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
          />
          <span className="time">{formatTime(audioState.duration)}</span>
        </div>

        <div className="volume-control">
          <span>🔊</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={audioState.volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div className="visualizer-settings">
        <div className="setting-group">
          <label>Style</label>
          <div className="toggle-group">
            {visualizerTypes.map((type) => (
              <button
                key={type}
                className={`toggle-btn ${settings.type === type ? 'active' : ''}`}
                onClick={() => onSettingsChange({ ...settings, type })}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-group">
          <label>Colors</label>
          <div className="toggle-group">
            {colorSchemes.map((scheme) => (
              <button
                key={scheme}
                className={`toggle-btn ${settings.colorScheme === scheme ? 'active' : ''}`}
                onClick={() => onSettingsChange({ ...settings, colorScheme: scheme })}
              >
                {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {settings.type !== 'waveform' && (
          <div className="setting-group">
            <label>Bars: {settings.barCount}</label>
            <input
              type="range"
              min={16}
              max={128}
              step={8}
              value={settings.barCount}
              onChange={(e) => onSettingsChange({ ...settings, barCount: parseInt(e.target.value) })}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Controls;
