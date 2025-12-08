import { useRef, useEffect } from 'react';

interface WaveformVisualizerProps {
  getWaveformData: () => Uint8Array;
  isPlaying: boolean;
  colorScheme: 'rainbow' | 'gradient' | 'solid';
}

const WaveformVisualizer = ({ getWaveformData, isPlaying, colorScheme }: WaveformVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const waveformData = getWaveformData();
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      const sliceWidth = width / waveformData.length;

      // Create gradient stroke
      let gradient: CanvasGradient | string;
      if (colorScheme === 'rainbow') {
        gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#ef4444');
        gradient.addColorStop(0.2, '#f97316');
        gradient.addColorStop(0.4, '#eab308');
        gradient.addColorStop(0.6, '#22c55e');
        gradient.addColorStop(0.8, '#3b82f6');
        gradient.addColorStop(1, '#8b5cf6');
      } else if (colorScheme === 'gradient') {
        gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#6366f1');
        gradient.addColorStop(1, '#ec4899');
      } else {
        gradient = '#6366f1';
      }

      ctx.lineWidth = 3;
      ctx.strokeStyle = gradient;
      ctx.beginPath();

      let x = 0;
      for (let i = 0; i < waveformData.length; i++) {
        const v = waveformData[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.stroke();

      // Glow effect
      ctx.shadowColor = colorScheme === 'solid' ? '#6366f1' : '#ec4899';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationRef.current = requestAnimationFrame(draw);
    };

    if (isPlaying) {
      draw();
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw flat line
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [getWaveformData, isPlaying, colorScheme]);

  return <canvas ref={canvasRef} width={800} height={400} className="visualizer-canvas" />;
};

export default WaveformVisualizer;
