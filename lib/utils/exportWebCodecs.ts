import {
  Input, Output, BlobSource, BufferTarget,
  Mp4OutputFormat, EncodedVideoPacketSource, EncodedAudioPacketSource,
  EncodedPacketSink, EncodedPacket, ALL_FORMATS,
} from 'mediabunny';
import { drawTextOverlays } from './drawOverlays';
import type { TextOverlayItem, SubtitleSegment, SubtitleStyle } from '@/lib/types';
import { drawSubtitles } from './drawSubtitles';

const W = 1080, H = 1920;
const FPS = 30;

/**
 * Export video via WebCodecs + Mediabunny.
 * Video: seek-based canvas rendering → VideoEncoder → Mediabunny output
 * Audio: demux du source MP4 → transmux direct (pas de re-encode)
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
    console.warn('[EXPORT] Mediabunny demux failed (fMP4?), exporting without audio:', e);
    input?.dispose();
    input = null;
  }

  // --- Configurer le muxer Mediabunny ---
  const output = new Output({
    format: new Mp4OutputFormat({ fastStart: 'in-memory' }),
    target: new BufferTarget(),
  });

  const videoSource = new EncodedVideoPacketSource('avc');
  output.addVideoTrack(videoSource);

  let audioSource: EncodedAudioPacketSource | null = null;
  let audioSink: EncodedPacketSink | null = null;
  if (audioTrack && audioTrack.numberOfChannels >= 1 && audioTrack.codec) {
    audioSource = new EncodedAudioPacketSource(audioTrack.codec);
    output.addAudioTrack(audioSource);
    audioSink = new EncodedPacketSink(audioTrack);
  }

  await output.start();

  // --- Video : encode via WebCodecs + Canvas ---
  const vEnc = new VideoEncoder({
    output: async (chunk, meta) => {
      const data = new Uint8Array(chunk.byteLength);
      chunk.copyTo(data);
      const ts = chunk.timestamp / 1e6; // microseconds → seconds
      const dur = (chunk.duration ?? 33333) / 1e6;
      const pkt = new EncodedPacket(data, chunk.type === 'key' ? 'key' : 'delta', ts, dur);
      await videoSource.add(pkt, meta || undefined);
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
    onProgress(Math.round(i / totalFrames * 90));

    if (i % 3 === 0) await new Promise(r => setTimeout(r, 0));
  }

  await vEnc.flush(); vEnc.close();

  // --- Audio : transmux les packets du source (trim par timestamp) ---
  if (audioSink && audioSource && audioTrack) {
    try {
      const startPkt = await audioSink.getKeyPacket(trimStart);
      if (startPkt) {
        let isFirst = true;
        for await (const pkt of audioSink.packets(startPkt)) {
          if (pkt.timestamp >= trimEnd) break;
          if (!pkt.data || pkt.data.length < 2) continue; // skip empty/config packets
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
      console.warn('[EXPORT] Audio transmux failed, trying Web Audio fallback:', e);
      // Fallback : Web Audio API decode → AudioEncoder AAC → Mediabunny output
      try {
        const ac = new AudioContext({ sampleRate: 48000 });
        const arrayBuf = await file.arrayBuffer();
        const decoded = await ac.decodeAudioData(arrayBuf);
        await ac.close();
        if (decoded.numberOfChannels >= 1) {
          const nCh = Math.min(decoded.numberOfChannels, 2);
          const sr = decoded.sampleRate;
          console.log('[EXPORT] Web Audio fallback: ' + nCh + 'ch, ' + sr + 'Hz, encoding AAC...');
          // Re-create audio source if needed (may not have been added due to demux failure)
          if (!audioSource) {
            audioSource = new EncodedAudioPacketSource('aac');
            output.addAudioTrack(audioSource);
          }
          const fallbackDone = new Promise<void>((resolve, reject) => {
            let isFirstChunk = true;
            const aEnc = new AudioEncoder({
              output: async (chunk, meta) => {
                const data = new Uint8Array(chunk.byteLength);
                chunk.copyTo(data);
                const pkt = new EncodedPacket(data, chunk.type === 'key' ? 'key' : 'delta', chunk.timestamp / 1e6, (chunk.duration ?? 0) / 1e6);
                if (isFirstChunk && meta) {
                  await audioSource!.add(pkt, meta);
                  isFirstChunk = false;
                } else {
                  await audioSource!.add(pkt);
                }
              },
              error: (err) => reject(err),
            });
            aEnc.configure({ codec: 'mp4a.40.2', sampleRate: sr, numberOfChannels: nCh, bitrate: 128_000 });
            const startSmp = Math.floor(trimStart * sr);
            const endSmp = Math.min(Math.floor(trimEnd * sr), decoded.length);
            const CHUNK_SIZE = 1024;
            for (let i = startSmp; i < endSmp; i += CHUNK_SIZE) {
              const len = Math.min(CHUNK_SIZE, endSmp - i);
              const planar = new Float32Array(len * nCh);
              for (let ch = 0; ch < nCh; ch++) planar.set(decoded.getChannelData(ch).subarray(i, i + len), ch * len);
              const ad = new AudioData({
                format: 'f32-planar', sampleRate: sr, numberOfFrames: len,
                numberOfChannels: nCh, timestamp: Math.round((i - startSmp) / sr * 1e6), data: planar,
              });
              aEnc.encode(ad); ad.close();
            }
            aEnc.flush().then(() => { aEnc.close(); resolve(); }).catch(reject);
          });
          await fallbackDone;
          console.log('[EXPORT] Web Audio fallback: audio encoded successfully');
        }
      } catch (e2) {
        console.warn('[EXPORT] Web Audio fallback also failed, exporting without audio:', e2);
      }
    }
  } else if (!audioTrack) {
    // Demux a echoue (fMP4 iPhone) — tenter Web Audio directement
    console.log('[EXPORT] No audio track from demux, trying Web Audio fallback...');
    try {
      const ac = new AudioContext({ sampleRate: 48000 });
      const arrayBuf = await file.arrayBuffer();
      const decoded = await ac.decodeAudioData(arrayBuf);
      await ac.close();
      if (decoded.numberOfChannels >= 1) {
        const nCh = Math.min(decoded.numberOfChannels, 2);
        const sr = decoded.sampleRate;
        console.log('[EXPORT] Web Audio fallback: ' + nCh + 'ch, ' + sr + 'Hz');
        const fbAudioSource = new EncodedAudioPacketSource('aac');
        output.addAudioTrack(fbAudioSource);
        const done = new Promise<void>((resolve, reject) => {
          let first = true;
          const aEnc = new AudioEncoder({
            output: async (chunk, meta) => {
              const data = new Uint8Array(chunk.byteLength);
              chunk.copyTo(data);
              const pkt = new EncodedPacket(data, chunk.type === 'key' ? 'key' : 'delta', chunk.timestamp / 1e6, (chunk.duration ?? 0) / 1e6);
              if (first && meta) { await fbAudioSource.add(pkt, meta); first = false; }
              else { await fbAudioSource.add(pkt); }
            },
            error: (err) => reject(err),
          });
          aEnc.configure({ codec: 'mp4a.40.2', sampleRate: sr, numberOfChannels: nCh, bitrate: 128_000 });
          const startSmp = Math.floor(trimStart * sr);
          const endSmp = Math.min(Math.floor(trimEnd * sr), decoded.length);
          for (let i = startSmp; i < endSmp; i += 1024) {
            const len = Math.min(1024, endSmp - i);
            const planar = new Float32Array(len * nCh);
            for (let ch = 0; ch < nCh; ch++) planar.set(decoded.getChannelData(ch).subarray(i, i + len), ch * len);
            const ad = new AudioData({ format: 'f32-planar', sampleRate: sr, numberOfFrames: len, numberOfChannels: nCh, timestamp: Math.round((i - startSmp) / sr * 1e6), data: planar });
            aEnc.encode(ad); ad.close();
          }
          aEnc.flush().then(() => { aEnc.close(); resolve(); }).catch(reject);
        });
        await done;
        console.log('[EXPORT] Web Audio fallback: audio encoded OK');
      }
    } catch (e) {
      console.warn('[EXPORT] Web Audio fallback failed, exporting without audio:', e);
    }
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
