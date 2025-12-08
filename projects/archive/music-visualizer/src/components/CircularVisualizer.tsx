import { useRef, useEffect } from 'react';

interface CircularVisualizerProps {
  getFrequencyData: () => Uint8Array;
  isPlaying: boolean;
  barCount: number;
  colorScheme: 'rainbow' | 'gradient' | 'solid';
}

const CircularVisualizer = ({ getFrequencyData, isPlaying, barCount, colorScheme }: CircularVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 100;

    const draw = () => {
      const frequencyData = getFrequencyData();

      ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const step = Math.floor(frequencyData.length / barCount);

      for (let i = 0; i < barCount; i++) {
        const value = frequencyData[i * step] || 0;
        const barHeight = (value / 255) * 150;

        const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2;

        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);

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

        ctx.strokeStyle = color;
        ctx.lineWidth = (2 * Math.PI * radius) / barCount - 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Inner glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 5;
      }

      // Draw center circle
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 10, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing ring based on bass
      const bassValue = frequencyData[0] / 255;
      ctx.strokeStyle = `rgba(99, 102, 241, ${0.3 + bassValue * 0.5})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 10 + bassValue * 10, 0, Math.PI * 2);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(draw);
    };

    if (isPlaying) {
      draw();
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw static circle
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [getFrequencyData, isPlaying, barCount, colorScheme]);

  return <canvas ref={canvasRef} width={800} height={400} className="visualizer-canvas" />;
};

export default CircularVisualizer;
