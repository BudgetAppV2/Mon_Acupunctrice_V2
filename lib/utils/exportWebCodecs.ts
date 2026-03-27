import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { drawTextOverlays } from './drawOverlays';
import type { TextOverlayItem, SubtitleSegment, SubtitleStyle } from '@/lib/types';
import { drawSubtitles } from './drawSubtitles';

const W = 1080, H = 1920;
const FPS = 30;
const FRAME_DUR = Math.round(1e6 / FPS); // microseconds per frame

/**
 * Export video via WebCodecs — seek-based loop (3-6x plus rapide que temps reel).
 * audioBlob : MP3 pre-extrait via FFmpeg pour eviter file.arrayBuffer() sur la video.
 */
export async function exportWithWebCodecs(
  file: File, trimStart: number, trimEnd: number,
  onProgress: (p: number) => void,
  filterCss?: string, overlays?: TextOverlayItem[],
  subtitles?: SubtitleSegment[], subtitleStyle?: string,
  audioBlob?: Blob | null,
): Promise<Blob> {
  // Decoder l'audio depuis le blob pre-extrait
  let audioBuf: AudioBuffer | null = null;
  if (audioBlob) {
    try {
      const ac = new AudioContext();
      audioBuf = await ac.decodeAudioData(await audioBlob.arrayBuffer());
      await ac.close();
    } catch { /* Audio decode echoue — export sans audio */ }
  }

  const nCh = audioBuf ? Math.min(audioBuf.numberOfChannels, 2) : 0;
  const sr = audioBuf?.sampleRate ?? 48000;
  // Guard : si 0 channels, l'audio est invalide — ne pas l'inclure
  const hasValidAudio = audioBuf != null && nCh >= 1;

  const muxerOpts: ConstructorParameters<typeof Muxer>[0] = {
    target: new ArrayBufferTarget(),
    video: { codec: 'avc', width: W, height: H },
    fastStart: 'in-memory',
    firstTimestampBehavior: 'offset',
  };
  if (hasValidAudio) muxerOpts.audio = { codec: 'aac', sampleRate: sr, numberOfChannels: nCh };
  const muxer = new Muxer(muxerOpts);

  const vEnc = new VideoEncoder({
    output: (chunk, meta) => {
      const data = new Uint8Array(chunk.byteLength);
      chunk.copyTo(data);
      const d = (chunk.duration != null && isFinite(chunk.duration) && chunk.duration > 0) ? chunk.duration : FRAME_DUR;
      muxer.addVideoChunkRaw(data, chunk.type, chunk.timestamp, d, meta);
    },
    error: (e) => { throw e; },
  });
  vEnc.configure({
    codec: 'avc1.640028', width: W, height: H, bitrate: 8_000_000, framerate: FPS,
    bitrateMode: 'variable', hardwareAcceleration: 'prefer-hardware',
    latencyMode: 'quality',
  });

  const video = document.createElement('video');
  video.muted = true; video.playsInline = true; video.preload = 'auto';
  const blobUrl = URL.createObjectURL(file);
  video.src = blobUrl;
  await new Promise<void>((res, rej) => { video.oncanplaythrough = () => res(); video.onerror = () => rej(new Error('Chargement video echoue')); });

  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Seek-based loop : 3-6x plus rapide que temps reel, fonctionne meme si le tab perd le focus
  const totalFrames = Math.ceil((trimEnd - trimStart) * FPS);
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

    const ts = Math.round((t - trimStart) * 1e6);
    const frame = new VideoFrame(canvas, { timestamp: ts });
    vEnc.encode(frame, { keyFrame: i % 30 === 0 });
    frame.close();
    onProgress(Math.round(i / totalFrames * 100));

    // Yield au thread principal pour ne pas bloquer l'UI
    if (i % 5 === 0) await new Promise(r => setTimeout(r, 0));
  }

  // Encoder l'audio (seulement si au moins 1 channel valide)
  if (hasValidAudio && audioBuf) {
    const aEnc = new AudioEncoder({ output: (c, m) => muxer.addAudioChunk(c, m), error: () => {} });
    aEnc.configure({ codec: 'mp4a.40.2', sampleRate: sr, numberOfChannels: nCh, bitrate: 128_000 });
    const startSmp = Math.floor(trimStart * sr);
    const endSmp = Math.min(Math.floor(trimEnd * sr), audioBuf.length);
    const CHUNK = 1024;
    for (let i = startSmp; i < endSmp; i += CHUNK) {
      const len = Math.min(CHUNK, endSmp - i);
      const planar = new Float32Array(len * nCh);
      for (let ch = 0; ch < nCh; ch++) planar.set(audioBuf.getChannelData(ch).subarray(i, i + len), ch * len);
      const ad = new AudioData({
        format: 'f32-planar', sampleRate: sr, numberOfFrames: len,
        numberOfChannels: nCh, timestamp: Math.round((i - startSmp) / sr * 1e6), data: planar,
      });
      aEnc.encode(ad); ad.close();
    }
    await aEnc.flush(); aEnc.close();
  }

  await vEnc.flush(); vEnc.close();

  // Nettoyage memoire
  video.pause(); video.removeAttribute('src'); video.load();
  URL.revokeObjectURL(blobUrl);
  canvas.width = 0; canvas.height = 0;
  audioBuf = null;

  muxer.finalize();
  return new Blob([(muxer.target as ArrayBufferTarget).buffer], { type: 'video/mp4' });
}
