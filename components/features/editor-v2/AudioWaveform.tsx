'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Props {
  blobUrl: string;
  height: number;
  fadeIn?: number;
  fadeOut?: number;
  duration?: number;
  audioDurationSec?: number;
  onFadeChange?: (fadeIn: number, fadeOut: number) => void;
}

export default function AudioWaveform({ blobUrl, height, fadeIn = 0, fadeOut = 0, duration = 0, audioDurationSec = 0, onFadeChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [amplitudes, setAmplitudes] = useState<number[] | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const cacheKeyRef = useRef<string>('');
  const dragRef = useRef<{ side: 'in' | 'out'; startX: number; origIn: number; origOut: number } | null>(null);

  // Measure container width dynamically
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setContainerWidth(Math.round(e.contentRect.width)));
    obs.observe(el);
    setContainerWidth(el.clientWidth);
    return () => obs.disconnect();
  }, []);

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
          for (let j = 0; j < samplesPerBar; j++) sum += Math.abs(raw[start + j] ?? 0);
          amps.push(sum / samplesPerBar);
        }
        const max = Math.max(...amps, 0.001);
        setAmplitudes(amps.map(a => a / max));
      } catch { /* no waveform */ }
    })();
    return () => { cancelled = true; };
  }, [blobUrl, amplitudes]);

  // Draw waveform — only the visible portion
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !amplitudes || containerWidth <= 0) return;
    canvas.width = containerWidth;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, containerWidth, height);

    // Visible ratio: how much of the audio is visible in the container
    const visibleRatio = (audioDurationSec > 0 && duration > 0) ? Math.min(1, duration / audioDurationSec) : 1;
    const visibleBars = Math.ceil(amplitudes.length * visibleRatio);
    const barW = containerWidth / visibleBars;

    ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
    for (let i = 0; i < visibleBars; i++) {
      const a = amplitudes[i] ?? 0;
      const barH = Math.max(1, a * height * 0.9);
      ctx.fillRect(i * barW, (height - barH) / 2, Math.max(1, barW - 0.5), barH);
    }
  }, [amplitudes, containerWidth, height, audioDurationSec, duration]);

  useEffect(() => { drawWaveform(); }, [drawWaveform]);

  const pxPerSec = duration > 0 ? containerWidth / duration : 0;
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
      onFadeChange(Math.round(newIn * 2) / 2, fadeOut);
    } else {
      const newOut = Math.max(0, Math.min(maxFade, dragRef.current.origOut - deltaSec));
      onFadeChange(fadeIn, Math.round(newOut * 2) / 2);
    }
  };

  const onHandleUp = () => { dragRef.current = null; };

  return (
    <div ref={containerRef} className="absolute inset-0"
      style={{ touchAction: 'none' }}
      onPointerMove={onHandleMove}
      onPointerUp={onHandleUp}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {fadeInPx > 0 && (
        <div className="absolute top-0 bottom-0 left-0 pointer-events-none"
          style={{ width: fadeInPx, background: 'linear-gradient(to right, rgba(0,0,0,0.6), transparent)' }} />
      )}
      {fadeOutPx > 0 && (
        <div className="absolute top-0 bottom-0 right-0 pointer-events-none"
          style={{ width: fadeOutPx, background: 'linear-gradient(to left, rgba(0,0,0,0.6), transparent)' }} />
      )}

      {duration > 0 && onFadeChange && (
        <div className="absolute top-0 bottom-0 z-10 cursor-col-resize flex items-center"
          style={{ left: fadeInPx - 4, width: 8 }}
          onPointerDown={e => onHandleDown('in', e)}>
          <div className="w-[3px] h-full bg-amber-400 rounded-full" />
        </div>
      )}
      {duration > 0 && onFadeChange && (
        <div className="absolute top-0 bottom-0 z-10 cursor-col-resize flex items-center"
          style={{ right: fadeOutPx - 4, width: 8 }}
          onPointerDown={e => onHandleDown('out', e)}>
          <div className="w-[3px] h-full bg-amber-400 rounded-full" />
        </div>
      )}
    </div>
  );
}
