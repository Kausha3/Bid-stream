# Music Visualizer

A real-time audio visualizer using the Web Audio API with multiple visualization styles and customizable settings.

## Features

- Drag & drop audio file upload
- Three visualization modes:
  - **Frequency Bars** - Classic equalizer-style bars
  - **Waveform** - Real-time oscilloscope view
  - **Circular** - Radial frequency visualization with pulsing center
- Color schemes: Rainbow, Gradient, Solid
- Adjustable bar count
- Playback controls with seek and volume
- Responsive design with dark theme

## Tech Stack

- React 19 + TypeScript
- Vite
- Web Audio API (AudioContext, AnalyserNode)
- Canvas API for rendering
- requestAnimationFrame for smooth 60fps animations

## Getting Started

```bash
npm install
npm run dev
```

Then drag & drop any audio file (MP3, WAV, OGG, etc.) to start visualizing.

## How It Works

1. **AudioContext** - Creates the audio processing graph
2. **AnalyserNode** - Performs FFT analysis on audio data
3. **getByteFrequencyData** - Returns frequency amplitude data (0-255)
4. **getByteTimeDomainData** - Returns waveform data
5. **Canvas** - Renders visualization using requestAnimationFrame loop

## Learning Highlights

- Web Audio API fundamentals (AudioContext, nodes, connections)
- FFT (Fast Fourier Transform) for frequency analysis
- Canvas rendering with requestAnimationFrame
- Cleanup with cancelAnimationFrame to prevent memory leaks
- Object URL creation/revocation for local files
