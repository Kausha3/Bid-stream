import { useRef, useEffect } from 'react';

interface FrequencyBarsProps {
  getFrequencyData: () => Uint8Array;
  isPlaying: boolean;
  barCount: number;
  colorScheme: 'rainbow' | 'gradient' | 'solid';
}

const FrequencyBars = ({ getFrequencyData, isPlaying, barCount, colorScheme }: FrequencyBarsProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const frequencyData = getFrequencyData();
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
      ctx.fillRect(0, 0, width, height);

      const barWidth = width / barCount;
      const step = Math.floor(frequencyData.length / barCount);

      for (let i = 0; i < barCount; i++) {
        const value = frequencyData[i * step] || 0;
        const barHeight = (value / 255) * height * 0.9;

        let color: string;
        if (colorScheme === 'rainbow') {
          const hue = (i / barCount) * 360;
          color = `hsl(${hue}, 80%, 60%)`;
        } else if (colorScheme === 'gradient') {
          const intensity = value / 255;
          color = `rgb(${Math.floor(99 + intensity * 156)}, ${Math.floor(102 - intensity * 50)}, 241)`;
        } else {
          color = '#6366f1';
        }

        ctx.fillStyle = color;

        const x = i * barWidth;
        const y = height - barHeight;

        ctx.beginPath();
        ctx.roundRect(x + 2, y, barWidth - 4, barHeight, 4);
        ctx.fill();

        // Reflection
        ctx.fillStyle = color.replace(')', ', 0.3)').replace('rgb', 'rgba').replace('hsl', 'hsla');
        ctx.beginPath();
        ctx.roundRect(x + 2, height, barWidth - 4, barHeight * 0.3, 4);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    if (isPlaying) {
      draw();
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [getFrequencyData, isPlaying, barCount, colorScheme]);

  return <canvas ref={canvasRef} width={800} height={400} className="visualizer-canvas" />;
};

export default FrequencyBars;
