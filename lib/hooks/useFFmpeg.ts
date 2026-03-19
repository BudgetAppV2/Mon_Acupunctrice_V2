'use client';

import { useState, useCallback, useRef } from 'react';
import type { FFmpeg } from '@ffmpeg/ffmpeg';

/**
 * Hook pour charger FFmpeg.wasm une seule fois (singleton).
 * Le binaire est chargé depuis un CDN via toBlobURL pour respecter COEP.
 */
export function useFFmpeg() {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const load = useCallback(async () => {
    if (ffmpegRef.current) return ffmpegRef.current;
    setLoading(true);

    const { FFmpeg } = await import('@ffmpeg/ffmpeg');
    const { toBlobURL } = await import('@ffmpeg/util');

    const ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    ffmpegRef.current = ffmpeg;
    setLoaded(true);
    setLoading(false);
    return ffmpeg;
  }, []);

  const terminate = useCallback(() => {
    ffmpegRef.current?.terminate();
    ffmpegRef.current = null;
    setLoaded(false);
  }, []);

  return { ffmpeg: ffmpegRef.current, loaded, loading, load, terminate };
}
