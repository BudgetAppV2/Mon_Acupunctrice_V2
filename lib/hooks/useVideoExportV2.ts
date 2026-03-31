'use client';

import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useEditorV2Store, getVideoTrack } from '@/lib/store/useEditorV2Store';
import { getFirebaseFirestore, getFirebaseAuth, getFirebaseStorage } from '@/lib/firebase';
import { renderFrame } from '@/lib/editor-v2/renderer';
import { FILTERS } from '@/lib/editor-v2/filters';
import { coverCrop } from '@/lib/editor-v2/playback';
import {
  Input, Output, BlobSource, BufferTarget,
  Mp4OutputFormat, CanvasSource, EncodedAudioPacketSource,
  EncodedPacketSink, EncodedPacket, ALL_FORMATS, AudioBufferSource,
} from 'mediabunny';
import { registerAacEncoder } from '@mediabunny/aac-encoder';

registerAacEncoder();

export type ExportV2State = 'idle' | 'preparing' | 'exporting' | 'uploading' | 'done' | 'error';

const MAX_W = 1080, MAX_H = 1920;
const FPS = 30;
const BITRATE = 12_000_000;

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

export function useVideoExportV2() {
  const [state, setState] = useState<ExportV2State>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const supportsWebCodecs = typeof window !== 'undefined'
    && typeof VideoEncoder !== 'undefined'
    && 'requestVideoFrameCallback' in HTMLVideoElement.prototype;

  const exportVideo = useCallback(async () => {
    const s = useEditorV2Store.getState();
    const vt = getVideoTrack(s.tracks);
    const clips = vt?.clips ?? [];
    if (clips.length === 0 || !clips[0]?.file || !s.itemId) return;
    if (clips.length > 1) { setState('error'); setError('L\'export multi-clip sera disponible prochainement.'); return; }

    setState('preparing');
    setProgress(0);
    setError(null);

    try {
      if (!supportsWebCodecs) {
        throw new Error('Ton navigateur ne supporte pas l\'export video. Utilise Safari 17+ ou Chrome.');
      }

      const clip = clips[0];
      const file = clip.file!;
      const trimStart = clip.trimStart / 1000;
      const trimEnd = clip.trimEnd / 1000;
      if (trimEnd <= trimStart) throw new Error('La video est trop courte pour l\'export.');

      // Resolve CSS filter for this clip
      const clipFilterId = (clip.filterId && clip.filterId !== 'normal') ? clip.filterId : s.filterId;
      const filterDef = FILTERS.find(f => f.id === clipFilterId);
      const filterCss = (filterDef?.css !== 'none' && s.filterIntensity > 0) ? filterDef?.css ?? 'none' : 'none';

      setState('exporting');

      // Demux source audio
      let input: Input | null = null;
      let audioTrack: Awaited<ReturnType<Input['getPrimaryAudioTrack']>> | null = null;
      try {
        input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
        audioTrack = await input.getPrimaryAudioTrack();
      } catch {
        input?.dispose();
        input = null;
      }

      // Load video for dimensions
      const video = document.createElement('video');
      video.muted = true; video.playsInline = true; video.preload = 'auto';
      const blobUrl = URL.createObjectURL(file);
      video.src = blobUrl;
      await new Promise<void>((res, rej) => { video.oncanplaythrough = () => res(); video.onerror = () => rej(new Error('Chargement video echoue')); });

      const { w: W, h: H } = computeExportSize(video.videoWidth, video.videoHeight);

      // Offscreen canvas
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = (canvas.getContext('2d', { colorSpace: 'display-p3' }) ?? canvas.getContext('2d'))!;

      // Muxer
      const output = new Output({
        format: new Mp4OutputFormat({ fastStart: 'in-memory' }),
        target: new BufferTarget(),
      });
      const canvasSource = new CanvasSource(canvas, {
        codec: 'avc', bitrate: BITRATE, bitrateMode: 'variable',
        hardwareAcceleration: 'prefer-hardware', latencyMode: 'quality',
      });
      output.addVideoTrack(canvasSource);

      // Audio setup
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

      // Frame loop — use Lab renderer for subtitles + overlays
      const totalFrames = Math.ceil((trimEnd - trimStart) * FPS);
      const frameDur = 1 / FPS;
      for (let i = 0; i < totalFrames; i++) {
        const t = trimStart + i / FPS;
        video.currentTime = t;
        await new Promise<void>((r) => { video.onseeked = () => r(); });

        // Draw video frame with filter
        if (filterCss !== 'none') ctx.filter = filterCss;
        const crop = coverCrop(video.videoWidth, video.videoHeight, W, H);
        ctx.drawImage(video, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, W, H);
        ctx.filter = 'none';

        // Render subtitles + text overlays via Lab renderer
        const currentMs = t * 1000;
        renderFrame({
          canvas, blocks: s.blocks, globalPreset: s.globalPreset,
          currentMs, nowMs: performance.now(),
          canvasWidth: W, canvasHeight: H,
          skipBackground: true,
          textOverlays: s.textOverlays,
        });

        await canvasSource.add(t - trimStart, frameDur);
        setProgress(Math.round(i / totalFrames * 90));
        if (i % 3 === 0) await new Promise(r => setTimeout(r, 0));
      }
      canvasSource.close();

      // Audio transmux or fallback
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
        } catch { /* audio transmux failed — silent video */ }
      }

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
        } catch { /* audio fallback failed — silent video */ }
        audioFallbackSource.close();
      }
      setProgress(95);

      // Cleanup
      video.pause(); video.removeAttribute('src'); video.load();
      URL.revokeObjectURL(blobUrl);
      canvas.width = 0; canvas.height = 0;
      input?.dispose();

      await output.finalize();
      setProgress(100);

      const buf = (output.target as BufferTarget).buffer;
      const blob = new Blob(buf ? [buf] : [], { type: 'video/mp4' });

      // Upload
      setState('uploading');
      const userId = getFirebaseAuth().currentUser?.uid;
      const storage = getFirebaseStorage();
      const storageRef = ref(storage, `videos/${userId}/${s.itemId}/export.mp4`);
      const videoUrl = await new Promise<string>((resolve, reject) => {
        const task = uploadBytesResumable(storageRef, blob);
        task.on('state_changed',
          (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          reject,
          async () => { resolve(await getDownloadURL(storageRef)); },
        );
      });

      // Thumbnail
      let thumbnailUrl: string | null = null;
      const thumbDataUrl = useEditorV2Store.getState().coverDataUrl;
      if (thumbDataUrl && userId) {
        try {
          const thumbBlob = await fetch(thumbDataUrl).then(r => r.blob());
          const thumbRef = ref(storage, `thumbnails/${userId}/${s.itemId}.jpg`);
          await uploadBytesResumable(thumbRef, thumbBlob, { contentType: 'image/jpeg' });
          thumbnailUrl = await getDownloadURL(thumbRef);
        } catch { /* thumbnail failed — non-blocking */ }
      }

      // Update Firestore
      const db = getFirebaseFirestore();
      await setDoc(doc(db, 'contentItems', s.itemId), {
        videoUrl, exportedAt: serverTimestamp(), workflowState: 'ready', updatedAt: serverTimestamp(),
        ...(thumbnailUrl ? { thumbnailUrl } : {}),
      }, { merge: true });

      setState('done');
    } catch (err) {
      setState('error');
      const msg = err instanceof Error ? err.message : 'Export echoue';
      if (msg.includes('memory') || msg.includes('OOM') || msg.includes('allocation')) {
        setError('La video est trop volumineuse. Essaie de la trimmer a moins de 60 secondes.');
      } else if (msg.includes('network') || msg.includes('upload')) {
        setError('La sauvegarde a echoue. Verifie ta connexion et reessaie.');
      } else {
        setError(msg);
      }
    }
  }, [supportsWebCodecs]);

  return { exportVideo, state, progress, error, supportsWebCodecs };
}
