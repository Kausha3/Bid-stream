import { useRef, useState, useCallback, useEffect } from 'react';
import type { AudioState } from '../types';

export const useAudioAnalyzer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1
  });

  const initializeAudio = useCallback((audioElement: HTMLAudioElement) => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    const audioContext = new AudioContext();
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    analyzer.smoothingTimeConstant = 0.8;

    const source = audioContext.createMediaElementSource(audioElement);
    source.connect(analyzer);
    analyzer.connect(audioContext.destination);

    audioContextRef.current = audioContext;
    analyzerRef.current = analyzer;
    sourceRef.current = source;
    audioRef.current = audioElement;

    audioElement.addEventListener('loadedmetadata', () => {
      setAudioState((prev) => ({ ...prev, duration: audioElement.duration }));
    });

    audioElement.addEventListener('timeupdate', () => {
      setAudioState((prev) => ({ ...prev, currentTime: audioElement.currentTime }));
    });

    audioElement.addEventListener('ended', () => {
      setAudioState((prev) => ({ ...prev, isPlaying: false }));
    });
  }, []);

  const getFrequencyData = useCallback(() => {
    if (!analyzerRef.current) return new Uint8Array(0);
    const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
    analyzerRef.current.getByteFrequencyData(dataArray);
    return dataArray;
  }, []);

  const getWaveformData = useCallback(() => {
    if (!analyzerRef.current) return new Uint8Array(0);
    const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
    analyzerRef.current.getByteTimeDomainData(dataArray);
    return dataArray;
  }, []);

  const play = useCallback(async () => {
    if (audioRef.current && audioContextRef.current) {
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      await audioRef.current.play();
      setAudioState((prev) => ({ ...prev, isPlaying: true }));
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setAudioState((prev) => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      setAudioState((prev) => ({ ...prev, volume }));
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    audioState,
    initializeAudio,
    getFrequencyData,
    getWaveformData,
    play,
    pause,
    seek,
    setVolume
  };
};
