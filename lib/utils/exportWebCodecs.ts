import {
  Input, Output, BlobSource, BufferTarget,
  Mp4OutputFormat, EncodedVideoPacketSource, EncodedAudioPacketSource,
  EncodedPacketSink, EncodedPacket, ALL_FORMATS, AudioBufferSource,
} from 'mediabunny';
import { registerAacEncoder } from '@mediabunny/aac-encoder';
import { drawTextOverlays } from './drawOverlays';
import type { TextOverlayItem, SubtitleSegment, SubtitleStyle } from '@/lib/types';
import { drawSubtitles } from './drawSubtitles';

registerAacEncoder();

const W = 1080, H = 1920;
const FPS = 30;

/** Fallback : decode audio via Web Audio API, encode AAC via Mediabunny AudioBufferSource */
async function addAudioViaBufferSource(file: File, trimStart: number, trimEnd: number, output: Output) {
  const ac = new AudioContext({ sampleRate: 48000 });
  const arrayBuf = await file.arrayBuffer();
  const decoded = await ac.decodeAudioData(arrayBuf);
  await ac.close();
  if (decoded.numberOfChannels < 1) return;
  const sr = decoded.sampleRate;
  const nCh = Math.min(decoded.numberOfChannels, 2);
  const startSmp = Math.floor(trimStart * sr);
  const endSmp = Math.min(Math.floor(trimEnd * sr), decoded.length);
  const trimmedLength = endSmp - startSmp;
  if (trimmedLength <= 0) return;
  const trimmedBuf = new AudioBuffer({ length: trimmedLength, sampleRate: sr, numberOfChannels: nCh });
  for (let ch = 0; ch < nCh; ch++) trimmedBuf.copyToChannel(decoded.getChannelData(ch).subarray(startSmp, endSmp), ch);
  const bufferSource = new AudioBufferSource({ codec: 'aac', bitrate: 128_000 });
  output.addAudioTrack(bufferSource);
  await bufferSource.add(trimmedBuf);
  bufferSource.close();
}

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

  // Préparer les tracks audio AVANT output.start()
  // On ajoute soit EncodedAudioPacketSource (transmux) soit AudioBufferSource (fallback)
  // mais on doit décider AVANT start() car on ne peut pas ajouter de tracks après
  let audioSource: EncodedAudioPacketSource | null = null;
  let audioSink: EncodedPacketSink | null = null;
  let audioFallbackSource: AudioBufferSource | null = null;
  // Tester si on peut vraiment lire les packets audio (fMP4 iPhone crash au transmux)
  let canTransmux = audioTrack && audioTrack.numberOfChannels >= 1 && audioTrack.codec;
  if (canTransmux && audioTrack) {
    try {
      const testSink = new EncodedPacketSink(audioTrack);
      const testPkt = await testSink.getFirstPacket();
      if (!testPkt || !testPkt.data || testPkt.data.length < 2) {
        console.warn('[EXPORT] Audio packets unreadable (fMP4?), using fallback');
        canTransmux = false;
      }
    } catch {
      console.warn('[EXPORT] Audio packet test failed (fMP4?), using fallback');
      canTransmux = false;
    }
  }

  if (canTransmux) {
    audioSource = new EncodedAudioPacketSource(audioTrack!.codec!);
    output.addAudioTrack(audioSource);
    audioSink = new EncodedPacketSink(audioTrack!);
  } else {
    // Pas de transmux possible — pré-ajouter AudioBufferSource pour le fallback
    audioFallbackSource = new AudioBufferSource({ codec: 'aac', bitrate: 128_000 });
    output.addAudioTrack(audioFallbackSource);
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
      console.warn('[EXPORT] Audio transmux failed, cannot recover (track already added as EncodedAudioPacketSource):', e);
      // Le track est déjà ajouté comme EncodedAudioPacketSource, on ne peut pas le changer
      // L'audio sera absente mais l'export ne crashera pas
    }
  }

  // Fallback : si on a un AudioBufferSource pré-ajouté, le remplir maintenant
  if (audioFallbackSource) {
    console.log('[EXPORT] Using AudioBufferSource fallback for audio...');
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
          console.log('[EXPORT] AudioBufferSource fallback: ' + nCh + 'ch, ' + sr + 'Hz, OK');
        }
      }
    } catch (e) {
      console.warn('[EXPORT] AudioBufferSource fallback failed, exporting without audio:', e);
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
