'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  blobUrl: string;
  width: number;
  height: number;
}

/** Generates and caches a simplified waveform from audio data */
export default function AudioWaveform({ blobUrl, width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [amplitudes, setAmplitudes] = useState<number[] | null>(null);
  const cacheKeyRef = useRef<string>('');

  // Decode audio and compute amplitudes (cached per blobUrl)
  useEffect(() => {
    if (cacheKeyRef.current === blobUrl && amplitudes) return;
    cacheKeyRef.current = blobUrl;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(blobUrl);
        const buf = await res.arrayBuffer();
        const ac = new AudioContext();
        const decoded = await ac.decodeAudioData(buf);
        await ac.close();
        if (cancelled) return;

        const raw = decoded.getChannelData(0);
        const bars = 100;
        const samplesPerBar = Math.floor(raw.length / bars);
        const amps: number[] = [];
        for (let i = 0; i < bars; i++) {
          let sum = 0;
          const start = i * samplesPerBar;
          for (let j = 0; j < samplesPerBar; j++) {
            sum += Math.abs(raw[start + j] ?? 0);
          }
          amps.push(sum / samplesPerBar);
        }
        // Normalize
        const max = Math.max(...amps, 0.001);
        setAmplitudes(amps.map(a => a / max));
      } catch {
        // Silently fail — no waveform displayed
      }
    })();
    return () => { cancelled = true; };
  }, [blobUrl, amplitudes]);

  // Draw waveform bars
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !amplitudes) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    const barW = width / amplitudes.length;
    ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
    amplitudes.forEach((a, i) => {
      const barH = Math.max(1, a * height * 0.9);
      ctx.fillRect(i * barW, (height - barH) / 2, Math.max(1, barW - 0.5), barH);
    });
  }, [amplitudes, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} className="absolute inset-0" />;
}
