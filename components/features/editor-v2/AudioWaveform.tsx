'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  blobUrl: string;
  width: number;
  height: number;
  fadeIn?: number;
  fadeOut?: number;
  duration?: number;
  onFadeChange?: (fadeIn: number, fadeOut: number) => void;
}

export default function AudioWaveform({ blobUrl, width, height, fadeIn = 0, fadeOut = 0, duration = 0, onFadeChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [amplitudes, setAmplitudes] = useState<number[] | null>(null);
  const cacheKeyRef = useRef<string>('');
  const dragRef = useRef<{ side: 'in' | 'out'; startX: number; origIn: number; origOut: number } | null>(null);

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
        const max = Math.max(...amps, 0.001);
        setAmplitudes(amps.map(a => a / max));
      } catch { /* no waveform */ }
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

  const pxPerSec = duration > 0 ? width / duration : 0;
  const fadeInPx = fadeIn * pxPerSec;
  const fadeOutPx = fadeOut * pxPerSec;
  const maxFade = duration / 2;

  const onHandleDown = (side: 'in' | 'out', e: React.PointerEvent) => {
    e.stopPropagation(); e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { side, startX: e.clientX, origIn: fadeIn, origOut: fadeOut };
  };

  const onHandleMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !onFadeChange || duration <= 0) return;
    e.stopPropagation();
    const dx = e.clientX - dragRef.current.startX;
    const deltaSec = dx / pxPerSec;
    if (dragRef.current.side === 'in') {
      const newIn = Math.max(0, Math.min(maxFade, dragRef.current.origIn + deltaSec));
      onFadeChange(Math.round(newIn * 2) / 2, fadeOut); // snap to 0.5s
    } else {
      const newOut = Math.max(0, Math.min(maxFade, dragRef.current.origOut - deltaSec));
      onFadeChange(fadeIn, Math.round(newOut * 2) / 2);
    }
  };

  const onHandleUp = () => { dragRef.current = null; };

  return (
    <div className="absolute inset-0" style={{ touchAction: 'none' }}>
      {/* Waveform canvas */}
      <canvas ref={canvasRef} width={width} height={height} className="absolute inset-0" />

      {/* Fade-in gradient overlay */}
      {fadeInPx > 0 && (
        <div className="absolute top-0 bottom-0 left-0 pointer-events-none"
          style={{ width: fadeInPx, background: 'linear-gradient(to right, rgba(0,0,0,0.6), transparent)' }} />
      )}

      {/* Fade-out gradient overlay */}
      {fadeOutPx > 0 && (
        <div className="absolute top-0 bottom-0 right-0 pointer-events-none"
          style={{ width: fadeOutPx, background: 'linear-gradient(to left, rgba(0,0,0,0.6), transparent)' }} />
      )}

      {/* Fade-in handle */}
      {duration > 0 && onFadeChange && (
        <div className="absolute top-0 bottom-0 z-10 cursor-col-resize flex items-center"
          style={{ left: fadeInPx - 4, width: 8 }}
          onPointerDown={e => onHandleDown('in', e)}
          onPointerMove={onHandleMove}
          onPointerUp={onHandleUp}>
          <div className="w-[3px] h-full bg-amber-400 rounded-full" />
        </div>
      )}

      {/* Fade-out handle */}
      {duration > 0 && onFadeChange && (
        <div className="absolute top-0 bottom-0 z-10 cursor-col-resize flex items-center"
          style={{ right: fadeOutPx - 4, width: 8 }}
          onPointerDown={e => onHandleDown('out', e)}
          onPointerMove={onHandleMove}
          onPointerUp={onHandleUp}>
          <div className="w-[3px] h-full bg-amber-400 rounded-full" />
        </div>
      )}
    </div>
  );
}
