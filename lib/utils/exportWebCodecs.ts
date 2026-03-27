import {
  Input, Output, BlobSource, BufferTarget,
  Mp4OutputFormat, CanvasSource, EncodedAudioPacketSource,
  EncodedPacketSink, EncodedPacket, ALL_FORMATS, AudioBufferSource,
} from 'mediabunny';
import { registerAacEncoder } from '@mediabunny/aac-encoder';
import { drawTextOverlays } from './drawOverlays';
import type { TextOverlayItem, SubtitleSegment, SubtitleStyle } from '@/lib/types';
import { drawSubtitles } from './drawSubtitles';

registerAacEncoder();

const MAX_W = 1080, MAX_H = 1920;
const FPS = 30;
const BITRATE = 12_000_000;

/** Calcule la resolution d'export optimale en 9:16 basee sur la source */
function computeExportSize(srcW: number, srcH: number): { w: number; h: number } {
  if (srcH > srcW) {
    const w = Math.min(srcW, MAX_W);
    const h = Math.round(w * 16 / 9);
    return { w: w % 2 === 0 ? w : w - 1, h: h % 2 === 0 ? h : h - 1 };
  }
  const cropH = srcH;
  const cropW = Math.round(cropH * 9 / 16);
  const scale = Math.min(2, MAX_H / cropH);
  let w = Math.round(cropW * scale);
  let h = Math.round(cropH * scale);
  if (w % 2 !== 0) w--;
  if (h % 2 !== 0) h--;
  return { w, h };
}

/**
 * Export video via Mediabunny CanvasSource + audio transmux/fallback.
 * Video: seek-based canvas rendering → CanvasSource (Mediabunny gere l'encodage)
 * Audio: demux transmux direct OU AudioBufferSource fallback (Safari iOS)
 */
export async function exportWithWebCodecs(
  file: File, trimStart: number, trimEnd: number,
  onProgress: (p: number) => void,
  filterCss?: string, overlays?: TextOverlayItem[],
  subtitles?: SubtitleSegment[], subtitleStyle?: string,
): Promise<Blob> {
  // --- Demuxer le source pour l'audio ---
  let input: Input | null = null;
  let audioTrack: Awaited<ReturnType<Input['getPrimaryAudioTrack']>> | null = null;
  try {
    input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
    audioTrack = await input.getPrimaryAudioTrack();
  } catch (e) {
    console.warn('[EXPORT] Mediabunny demux failed (fMP4?):', e);
    input?.dispose();
    input = null;
  }

  // --- Charger la video pour connaitre la resolution source ---
  const video = document.createElement('video');
  video.muted = true; video.playsInline = true; video.preload = 'auto';
  const blobUrl = URL.createObjectURL(file);
  video.src = blobUrl;
  await new Promise<void>((res, rej) => { video.oncanplaythrough = () => res(); video.onerror = () => rej(new Error('Chargement video echoue')); });

  const { w: W, h: H } = computeExportSize(video.videoWidth, video.videoHeight);

  // --- Canvas avec couleurs P3 si disponible ---
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = (canvas.getContext('2d', { colorSpace: 'display-p3' }) ?? canvas.getContext('2d'))!;

  // --- Configurer le muxer Mediabunny ---
  const output = new Output({
    format: new Mp4OutputFormat({ fastStart: 'in-memory' }),
    target: new BufferTarget(),
  });

  // Video : CanvasSource gere VideoEncoder en interne
  const canvasSource = new CanvasSource(canvas, {
    codec: 'avc', bitrate: BITRATE, bitrateMode: 'variable',
    hardwareAcceleration: 'prefer-hardware', latencyMode: 'quality',
  });
  output.addVideoTrack(canvasSource);

  // Audio : transmux (desktop) ou AudioBufferSource fallback (iOS)
  let audioSource: EncodedAudioPacketSource | null = null;
  let audioSink: EncodedPacketSink | null = null;
  let audioFallbackSource: AudioBufferSource | null = null;
  const isIOS = typeof navigator !== 'undefined' && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
  const canTransmux = !isIOS && audioTrack && audioTrack.numberOfChannels >= 1 && audioTrack.codec;

  if (canTransmux) {
    audioSource = new EncodedAudioPacketSource(audioTrack!.codec!);
    output.addAudioTrack(audioSource);
    audioSink = new EncodedPacketSink(audioTrack!);
  } else {
    audioFallbackSource = new AudioBufferSource({ codec: 'aac', bitrate: 128_000 });
    output.addAudioTrack(audioFallbackSource);
  }

  await output.start();

  // --- Boucle seek-based : dessiner sur le canvas, CanvasSource encode ---
  const totalFrames = Math.ceil((trimEnd - trimStart) * FPS);
  const frameDur = 1 / FPS;
  for (let i = 0; i < totalFrames; i++) {
    const t = trimStart + i / FPS;
    video.currentTime = t;
    await new Promise<void>((r) => { video.onseeked = () => r(); });

    if (filterCss && filterCss !== 'none') ctx.filter = filterCss;
    const { videoWidth: vw, videoHeight: vh } = video;
    const videoAspect = vw / vh, canvasAspect = W / H;
    let sx = 0, sy = 0, sw = vw, sh = vh;
    if (videoAspect > canvasAspect) { sw = vh * canvasAspect; sx = (vw - sw) / 2; }
    else { sh = vw / canvasAspect; sy = (vh - sh) / 2; }
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, W, H);
    ctx.filter = 'none';

    if (overlays?.length) drawTextOverlays(ctx, overlays, t, W, H);
    if (subtitles?.length) drawSubtitles(ctx, subtitles, (subtitleStyle || 'classic') as SubtitleStyle, t, W, H);

    await canvasSource.add(t - trimStart, frameDur);
    onProgress(Math.round(i / totalFrames * 90));

    if (i % 3 === 0) await new Promise(r => setTimeout(r, 0));
  }
  canvasSource.close();

  // --- Audio : transmux les packets du source (trim par timestamp) ---
  if (audioSink && audioSource && audioTrack) {
    try {
      const startPkt = await audioSink.getKeyPacket(trimStart);
      if (startPkt) {
        let isFirst = true;
        for await (const pkt of audioSink.packets(startPkt)) {
          if (pkt.timestamp >= trimEnd) break;
          if (!pkt.data || pkt.data.length < 2) continue;
          const adjusted = new EncodedPacket(pkt.data, pkt.type, pkt.timestamp - trimStart, pkt.duration);
          if (isFirst) {
            await audioSource.add(adjusted, {
              decoderConfig: {
                codec: audioTrack.codec === 'aac' ? 'mp4a.40.2' : audioTrack.codec,
                numberOfChannels: audioTrack.numberOfChannels,
                sampleRate: audioTrack.sampleRate,
              },
            } as EncodedAudioChunkMetadata);
            isFirst = false;
          } else {
            await audioSource.add(adjusted);
          }
        }
      }
    } catch (e) {
      console.warn('[EXPORT] Audio transmux failed:', e);
    }
  }

  // Fallback : remplir le AudioBufferSource pre-ajoute
  if (audioFallbackSource) {
    try {
      const ac = new AudioContext({ sampleRate: 48000 });
      const arrayBuf = await file.arrayBuffer();
      const decoded = await ac.decodeAudioData(arrayBuf);
      await ac.close();
      if (decoded.numberOfChannels >= 1) {
        const sr = decoded.sampleRate;
        const nCh = Math.min(decoded.numberOfChannels, 2);
        const startSmp = Math.floor(trimStart * sr);
        const endSmp = Math.min(Math.floor(trimEnd * sr), decoded.length);
        const trimmedLength = endSmp - startSmp;
        if (trimmedLength > 0) {
          const trimmedBuf = new AudioBuffer({ length: trimmedLength, sampleRate: sr, numberOfChannels: nCh });
          for (let ch = 0; ch < nCh; ch++) trimmedBuf.copyToChannel(decoded.getChannelData(ch).subarray(startSmp, endSmp), ch);
          await audioFallbackSource.add(trimmedBuf);
        }
      }
    } catch (e) {
      console.warn('[EXPORT] AudioBufferSource fallback failed:', e);
    }
    audioFallbackSource.close();
  }
  onProgress(95);

  // --- Cleanup ---
  video.pause(); video.removeAttribute('src'); video.load();
  URL.revokeObjectURL(blobUrl);
  canvas.width = 0; canvas.height = 0;
  input?.dispose();

  await output.finalize();
  onProgress(100);

  const buf = (output.target as BufferTarget).buffer;
  return new Blob(buf ? [buf] : [], { type: 'video/mp4' });
}
