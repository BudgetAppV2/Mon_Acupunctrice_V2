import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { drawTextOverlays } from './drawOverlays';
import type { TextOverlayItem, SubtitleSegment, SubtitleStyle } from '@/lib/types';
import { drawSubtitles } from './drawSubtitles';

const W = 1080, H = 1920;

/**
 * Export video via WebCodecs (hardware-accelerated).
 * audioBlob optionnel : WAV pre-extrait via FFmpeg pour eviter file.arrayBuffer() sur le fichier entier.
 */
export async function exportWithWebCodecs(
  file: File, trimStart: number, trimEnd: number,
  onProgress: (p: number) => void,
  filterCss?: string, overlays?: TextOverlayItem[],
  subtitles?: SubtitleSegment[], subtitleStyle?: string,
  audioBlob?: Blob | null,
): Promise<Blob> {
  const dur = trimEnd - trimStart;

  // Decoder l'audio depuis le blob pre-extrait (pas depuis le fichier video entier)
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

  const muxerOpts: ConstructorParameters<typeof Muxer>[0] = {
    target: new ArrayBufferTarget(),
    video: { codec: 'avc', width: W, height: H },
    fastStart: 'in-memory',
    firstTimestampBehavior: 'offset',
  };
  if (audioBuf) muxerOpts.audio = { codec: 'aac', sampleRate: sr, numberOfChannels: nCh };
  const muxer = new Muxer(muxerOpts);

  const FRAME_DUR = 33333;
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
    codec: 'avc1.4d0028', width: W, height: H, bitrate: 8_000_000, framerate: 30,
    bitrateMode: 'variable', hardwareAcceleration: 'prefer-hardware',
  });

  const video = document.createElement('video');
  video.muted = true; video.playsInline = true; video.preload = 'auto';
  video.src = URL.createObjectURL(file);
  await new Promise<void>((res, rej) => { video.oncanplaythrough = () => res(); video.onerror = () => rej(new Error('Chargement video echoue')); });

  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  video.currentTime = trimStart;
  await new Promise<void>((r) => { video.onseeked = () => r(); });

  let frameCount = 0;
  await new Promise<void>((resolve) => {
    video.onended = () => resolve();
    const capture = (_now: DOMHighResTimeStamp, meta: VideoFrameCallbackMetadata) => {
      if (meta.mediaTime >= trimEnd) { video.pause(); resolve(); return; }
      if (meta.mediaTime < trimStart) { video.requestVideoFrameCallback(capture); return; }

      if (filterCss && filterCss !== 'none') ctx.filter = filterCss;
      const { videoWidth: vw, videoHeight: vh } = video;
      const videoAspect = vw / vh, canvasAspect = W / H;
      let sx = 0, sy = 0, sw = vw, sh = vh;
      if (videoAspect > canvasAspect) { sw = vh * canvasAspect; sx = (vw - sw) / 2; }
      else { sh = vw / canvasAspect; sy = (vh - sh) / 2; }
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, W, H);
      ctx.filter = 'none';

      if (overlays?.length) drawTextOverlays(ctx, overlays, meta.mediaTime, W, H);
      if (subtitles?.length) drawSubtitles(ctx, subtitles, (subtitleStyle || 'classic') as SubtitleStyle, meta.mediaTime, W, H);

      const ts = Math.round((meta.mediaTime - trimStart) * 1e6);
      const frame = new VideoFrame(canvas, { timestamp: ts });
      vEnc.encode(frame, { keyFrame: frameCount % 60 === 0 });
      frame.close();
      frameCount++;
      onProgress(Math.round((meta.mediaTime - trimStart) / dur * 100));
      video.requestVideoFrameCallback(capture);
    };
    video.requestVideoFrameCallback(capture);
    video.play();
  });

  if (audioBuf) {
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
  URL.revokeObjectURL(video.src);
  muxer.finalize();
  return new Blob([(muxer.target as ArrayBufferTarget).buffer], { type: 'video/mp4' });
}
