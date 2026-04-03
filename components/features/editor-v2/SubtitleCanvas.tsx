'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useEditorV2Store, getVideoTrack, getVideoTracks } from '@/lib/store/useEditorV2Store';
import { renderFrame } from '@/lib/editor-v2/renderer';
import { FILTERS } from '@/lib/editor-v2/filters';
import { CANVAS_W, CANVAS_H, findActiveClipsAllTracks, getFirstAudioUrl, createVideoElement } from '@/lib/editor-v2/playback';
import { useSubtitleDrag } from '@/lib/editor-v2/useSubtitleDrag';
import { initWebGL, renderVideoFrame, destroyWebGL, cssFilterToUniforms, IDENTITY_UNIFORMS } from '@/lib/editor-v2/webglRenderer';
import type { Track } from '@/lib/editor-v2/types';

// --- Silent WAV blob for Safari iOS keeper ---
function createSilentWavBlobUrl(): string {
  const sampleRate = 44100;
  const numSamples = sampleRate; // 1 second of silence
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);
  const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  w(8, 'WAVE'); w(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  w(36, 'data');
  view.setUint32(40, numSamples * 2, true);
  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
}

// --- Audio Engine ---
// Video audio: decodeAudioData → AudioBufferSourceNode (Safari iOS compatible)
// Music audio: createMediaElementSource(audioElement) (works for <audio>)

interface AudioEngineState {
  ctx: AudioContext;
  gains: Map<string, GainNode>;
  musicSource: MediaElementAudioSourceNode | null;
  audioBuffers: Map<string, AudioBuffer>; // clipId → decoded audio
  activeSources: Map<string, AudioBufferSourceNode>; // trackId → playing source
}

function useAudioEngine() {
  const engineRef = useRef<AudioEngineState | null>(null);

  const getOrCreateEngine = useCallback((): AudioEngineState => {
    if (engineRef.current) return engineRef.current;
    const ctx = new AudioContext();
    // iOS 17+: treat Web Audio as media playback (not UI sound) — plays even with ringer switch off
    if ('audioSession' in navigator) {
      (navigator as unknown as Record<string, { type: string }>).audioSession.type = 'playback';
      console.log('[AUDIO_ENGINE] Set audioSession.type = playback');
    }
    engineRef.current = { ctx, gains: new Map(), musicSource: null, audioBuffers: new Map(), activeSources: new Map() };
    console.log('[AUDIO_ENGINE] Created AudioContext, state:', ctx.state);
    return engineRef.current;
  }, []);

  // Connect music <audio> element (createMediaElementSource works for <audio>)
  const connectMusic = useCallback((el: HTMLAudioElement) => {
    const engine = getOrCreateEngine();
    if (engine.musicSource) return; // already connected
    const source = engine.ctx.createMediaElementSource(el);
    const gain = engine.ctx.createGain();
    source.connect(gain).connect(engine.ctx.destination);
    engine.musicSource = source;
    engine.gains.set('music', gain);
    console.log('[AUDIO_ENGINE] Connected music → GainNode → destination');
  }, [getOrCreateEngine]);

  // Ensure a GainNode exists for a video track
  const ensureTrackGain = useCallback((trackId: string) => {
    const engine = getOrCreateEngine();
    if (engine.gains.has(trackId)) return;
    const gain = engine.ctx.createGain();
    gain.connect(engine.ctx.destination);
    engine.gains.set(trackId, gain);
  }, [getOrCreateEngine]);

  // Decode video file audio into an AudioBuffer (cached per clipId)
  const decodeClipAudio = useCallback(async (clipId: string, file: File) => {
    const engine = getOrCreateEngine();
    if (engine.audioBuffers.has(clipId)) return;
    try {
      const arrayBuf = await file.arrayBuffer();
      const audioBuffer = await engine.ctx.decodeAudioData(arrayBuf);
      engine.audioBuffers.set(clipId, audioBuffer);
      console.log('[AUDIO_ENGINE] Decoded clip', clipId.slice(0, 8), 'duration:', audioBuffer.duration.toFixed(1) + 's');
    } catch (e) {
      console.log('[AUDIO_ENGINE] Failed to decode clip audio', clipId.slice(0, 8), e);
    }
  }, [getOrCreateEngine]);

  // Play clip audio from a decoded buffer at a given offset
  const playClipAudio = useCallback((trackId: string, clipId: string, offsetSec: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    const buffer = engine.audioBuffers.get(clipId);
    if (!buffer) return;
    // Stop previous source on this track
    const old = engine.activeSources.get(trackId);
    if (old) { try { old.stop(); } catch {} }
    const gain = engine.gains.get(trackId);
    if (!gain) return;
    const source = engine.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(gain);
    const clampedOffset = Math.max(0, Math.min(offsetSec, buffer.duration - 0.01));
    source.start(0, clampedOffset);
    engine.activeSources.set(trackId, source);
    console.log('[AUDIO_ENGINE] Playing clip audio', trackId, clipId.slice(0, 8), 'offset:', clampedOffset.toFixed(2));
  }, []);

  // Stop clip audio on a track
  const stopTrackAudio = useCallback((trackId: string) => {
    const engine = engineRef.current;
    if (!engine) return;
    const source = engine.activeSources.get(trackId);
    if (source) { try { source.stop(); } catch {} engine.activeSources.delete(trackId); }
  }, []);

  // Stop all clip audio
  const stopAllClipAudio = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    for (const [id, source] of engine.activeSources) {
      try { source.stop(); } catch {}
    }
    engine.activeSources.clear();
  }, []);

  const setGain = useCallback((trackId: string, value: number) => {
    const gain = engineRef.current?.gains.get(trackId);
    if (gain) gain.gain.value = Math.max(0, Math.min(1, value));
  }, []);

  const resume = useCallback(async () => {
    const engine = engineRef.current;
    if (engine && engine.ctx.state !== 'running') {
      await engine.ctx.resume();
      console.log('[AUDIO_ENGINE] Resumed, state:', engine.ctx.state);
    }
  }, []);

  const cleanup = useCallback(() => {
    if (engineRef.current) {
      stopAllClipAudio();
      engineRef.current.ctx.close().catch(() => {});
      engineRef.current = null;
    }
  }, [stopAllClipAudio]);

  // Resume on any user gesture (Safari iOS)
  useEffect(() => {
    const handleGesture = () => {
      const engine = engineRef.current;
      if (engine && engine.ctx.state === 'suspended') {
        engine.ctx.resume().then(() => {
          console.log('[AUDIO_ENGINE] Resumed via user gesture, state:', engine.ctx.state);
        });
      }
    };
    document.addEventListener('touchstart', handleGesture, { passive: true });
    document.addEventListener('click', handleGesture);
    return () => { document.removeEventListener('touchstart', handleGesture); document.removeEventListener('click', handleGesture); };
  }, []);

  return { connectMusic, ensureTrackGain, decodeClipAudio, playClipAudio, stopTrackAudio, stopAllClipAudio, setGain, resume, cleanup, engineRef };
}

// --- Per-track video elements ---

function useTrackVideos() {
  const videosRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const activeClipRef = useRef<Map<string, string>>(new Map());
  const getOrCreate = useCallback((trackId: string): HTMLVideoElement => {
    let vid = videosRef.current.get(trackId);
    if (vid) return vid;
    vid = createVideoElement(); // muted=true by default — video stays muted always
    videosRef.current.set(trackId, vid);
    return vid;
  }, []);
  const cleanup = useCallback(() => {
    for (const vid of videosRef.current.values()) { vid.pause(); vid.removeAttribute('src'); vid.load(); }
    videosRef.current.clear(); activeClipRef.current.clear();
  }, []);
  return { getOrCreate, videosRef, activeClipRef, cleanup };
}

// --- Main Component ---

export default function SubtitleCanvas() {
  // Build markers
  useEffect(() => { console.log('[EDITOR_V2] build:2026-04-02T22:30 — trim-detect-map + audio-mix'); }, []);
  useEffect(() => { console.log('[EDITOR_V2] M1-fix10 — blob URL keeper + audioSession playback'); }, []);

  const glCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const musicElRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number>(0);
  const glInitRef = useRef(false);

  const { getOrCreate: getTrackVideo, videosRef, activeClipRef, cleanup: cleanupVideos } = useTrackVideos();
  const { connectMusic, ensureTrackGain, decodeClipAudio, playClipAudio, stopTrackAudio, stopAllClipAudio, setGain, resume: resumeAudio, cleanup: cleanupAudio, engineRef } = useAudioEngine();

  const { blocks, globalPreset, currentTime, isPlaying, duration,
    filterId, videoUrl, voiceVolume, audioVolume, tracks, filterIntensity: fIntensity,
    textOverlays } = useEditorV2Store();
  const { isDragging, onDown, onMove, onUp } = useSubtitleDrag();

  // Refs for RAF loop
  const blocksRef = useRef(blocks);
  const presetRef = useRef(globalPreset);
  const textOverlaysRef = useRef(textOverlays);
  const timeRef = useRef(currentTime);
  const tracksRef = useRef(tracks);
  const filterIdRef = useRef(filterId);
  const fIntensityRef = useRef(fIntensity);
  const voiceVolumeRef = useRef(voiceVolume);
  const audioVolumeRef = useRef(audioVolume);

  useEffect(() => { blocksRef.current = blocks; }, [blocks]);
  useEffect(() => { presetRef.current = globalPreset; }, [globalPreset]);
  useEffect(() => { textOverlaysRef.current = textOverlays; }, [textOverlays]);
  useEffect(() => { timeRef.current = currentTime; }, [currentTime]);
  useEffect(() => { tracksRef.current = tracks; }, [tracks]);
  useEffect(() => { filterIdRef.current = filterId; }, [filterId]);
  useEffect(() => { fIntensityRef.current = fIntensity; }, [fIntensity]);
  useEffect(() => { voiceVolumeRef.current = voiceVolume; }, [voiceVolume]);
  useEffect(() => { audioVolumeRef.current = audioVolume; }, [audioVolume]);

  // Init WebGL
  useEffect(() => {
    const glCanvas = glCanvasRef.current;
    if (glCanvas && !glInitRef.current) glInitRef.current = initWebGL(glCanvas);
    return () => { destroyWebGL(); glInitRef.current = false; };
  }, []);

  useEffect(() => () => {
    cleanupVideos(); cleanupAudio();
    if (keeperRef.current) { keeperRef.current.pause(); keeperRef.current.removeAttribute('src'); keeperRef.current = null; }
  }, [cleanupVideos, cleanupAudio]);

  // --- Music element ---
  useEffect(() => {
    const url = getFirstAudioUrl(tracks);
    if (url) {
      if (!musicElRef.current) { musicElRef.current = new Audio(); musicElRef.current.loop = true; }
      if (musicElRef.current.src !== url) musicElRef.current.src = url;
      connectMusic(musicElRef.current);
    } else if (musicElRef.current) {
      musicElRef.current.pause(); musicElRef.current.removeAttribute('src');
      musicElRef.current = null;
    }
  }, [tracks, connectMusic]);

  // --- Init first clip: video element + decode audio ---
  useEffect(() => {
    if (!videoUrl) return;
    const firstTrack = getVideoTrack(useEditorV2Store.getState().tracks);
    const firstClip = firstTrack?.clips?.[0];
    if (!firstClip || !firstTrack) return;
    const vid = getTrackVideo(firstTrack.id);
    vid.src = videoUrl;
    activeClipRef.current.set(firstTrack.id, firstClip.id);
    ensureTrackGain(firstTrack.id);
    // Decode audio from File object
    if (firstClip.file) decodeClipAudio(firstClip.id, firstClip.file);
    const onMeta = () => {
      if (vid.duration && isFinite(vid.duration)) {
        const dMs = vid.duration * 1000;
        const store = useEditorV2Store.getState();
        store.setDuration(dMs);
        store.initClipDuration(firstClip.id, dMs);
        vid.currentTime = Math.min(2, vid.duration);
        vid.onseeked = () => {
          try {
            const c = document.createElement('canvas'); c.width = 90; c.height = 160;
            c.getContext('2d')!.drawImage(vid, 0, 0, 90, 160);
            const u = c.toDataURL('image/jpeg', 0.7);
            if (u.length > 100) store.setThumbnail(u);
          } catch {}
          vid.currentTime = 0.01; vid.onseeked = null;
        };
      }
    };
    vid.addEventListener('loadedmetadata', onMeta);
    return () => vid.removeEventListener('loadedmetadata', onMeta);
  }, [videoUrl, getTrackVideo, ensureTrackGain, decodeClipAudio, activeClipRef]);

  // --- Pre-load additional track videos + decode audio ---
  useEffect(() => {
    for (const t of getVideoTracks(tracks)) {
      if (!videosRef.current.has(t.id) && t.clips?.length) {
        const clip = t.clips[0];
        if (clip.blobUrl) {
          const vid = getTrackVideo(t.id);
          vid.src = clip.blobUrl;
          activeClipRef.current.set(t.id, clip.id);
          ensureTrackGain(t.id);
          if (clip.file) decodeClipAudio(clip.id, clip.file);
          if (clip.duration === 0) {
            const cid = clip.id;
            vid.addEventListener('loadedmetadata', () => {
              if (vid.duration && isFinite(vid.duration)) useEditorV2Store.getState().initClipDuration(cid, vid.duration * 1000);
            }, { once: true });
          }
        }
      }
      // Decode audio for all clips with files
      for (const c of t.clips ?? []) {
        if (c.file && !engineRef.current?.audioBuffers.has(c.id)) decodeClipAudio(c.id, c.file);
      }
    }
  }, [tracks, getTrackVideo, ensureTrackGain, decodeClipAudio, videosRef, activeClipRef, engineRef]);

  // --- Draw functions ---
  const drawVideo = useCallback(() => {
    if (!glInitRef.current) return;
    const t = timeRef.current;
    const allTracks = tracksRef.current;
    const hasClips = allTracks.some(tr => tr.type === 'video' && tr.clips && tr.clips.length > 0);
    if (hasClips) {
      const activeClips = findActiveClipsAllTracks(allTracks, t);
      if (activeClips.length === 0) {
        const gl = glCanvasRef.current?.getContext('webgl');
        if (gl) { gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); }
      } else {
        for (let i = activeClips.length - 1; i >= 0; i--) {
          const { clip } = activeClips[i];
          const trackId = getVideoTracks(allTracks)[activeClips[i].trackIndex]?.id;
          if (!trackId) continue;
          const vid = videosRef.current.get(trackId);
          if (!vid || vid.readyState < 2 || vid.videoWidth === 0) continue;
          const cFid = (clip.filterId && clip.filterId !== 'normal') ? clip.filterId : filterIdRef.current;
          const af = FILTERS.find(f => f.id === cFid);
          const uniforms = af ? cssFilterToUniforms(af.css, fIntensityRef.current) : IDENTITY_UNIFORMS;
          renderVideoFrame(vid, CANVAS_W, CANVAS_H, uniforms);
        }
      }
    } else {
      const gl = glCanvasRef.current?.getContext('webgl');
      if (gl) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); }
    }
  }, [videosRef]);

  const drawOverlay = useCallback(() => {
    const overlay = overlayCanvasRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;
    const t = timeRef.current;
    const hasClips = tracksRef.current.some(tr => tr.type === 'video' && tr.clips && tr.clips.length > 0);
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    renderFrame({
      canvas: overlay, blocks: blocksRef.current, globalPreset: presetRef.current,
      currentMs: t, nowMs: performance.now(), canvasWidth: CANVAS_W, canvasHeight: CANVAS_H,
      skipBackground: hasClips, textOverlays: textOverlaysRef.current,
    });
  }, []);

  const drawFrame = useCallback(() => { drawVideo(); drawOverlay(); }, [drawVideo, drawOverlay]);

  // --- Play/pause ---
  const prevPlayingRef = useRef(false);
  const keeperRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (isPlaying && !prevPlayingRef.current) {
      console.log('[AUDIO_ENGINE] Play pressed, ctx state:', engineRef.current?.ctx.state ?? 'no engine');
      resumeAudio().then(() => {
        console.log('[AUDIO_ENGINE] After resume, ctx state:', engineRef.current?.ctx.state);
        // Silent keeper: a looping <audio> connected via createMediaElementSource
        // keeps Safari iOS audio pipeline active for AudioBufferSourceNodes
        if (!keeperRef.current && engineRef.current) {
          const keeper = new Audio();
          keeper.src = createSilentWavBlobUrl(); // blob URL, not data URI — Safari iOS requires real blob
          keeper.loop = true;
          const src = engineRef.current.ctx.createMediaElementSource(keeper);
          const gain = engineRef.current.ctx.createGain();
          gain.gain.value = 0;
          src.connect(gain).connect(engineRef.current.ctx.destination);
          keeper.play().catch(() => {});
          keeperRef.current = keeper;
          console.log('[AUDIO_ENGINE] Silent keeper (blob URL) started');
        }
        const t = useEditorV2Store.getState().currentTime;
        const allTracks = tracksRef.current;
        const actives = findActiveClipsAllTracks(allTracks, t);
        for (const { clip, localTimeMs, trackIndex } of actives) {
          const track = getVideoTracks(allTracks)[trackIndex];
          if (!track || !clip.blobUrl) continue;
          const vid = getTrackVideo(track.id);
          if (activeClipRef.current.get(track.id) !== clip.id) {
            vid.src = clip.blobUrl;
            activeClipRef.current.set(track.id, clip.id);
          }
          vid.currentTime = localTimeMs / 1000;
          vid.play().catch(() => {}); // video stays muted — image only
          // Audio started by playback tick (avoids double-call race condition)
        }
        if (musicElRef.current) {
          musicElRef.current.currentTime = t / 1000;
          musicElRef.current.play().catch(() => {});
          setGain('music', audioVolumeRef.current);
        }
      });
    } else if (!isPlaying) {
      for (const vid of videosRef.current.values()) vid.pause();
      stopAllClipAudio();
      if (musicElRef.current) musicElRef.current.pause();
    }
    prevPlayingRef.current = isPlaying;
  }, [isPlaying, getTrackVideo, resumeAudio, setGain, stopAllClipAudio, videosRef, activeClipRef, engineRef]);

  // --- Scrub (paused) ---
  useEffect(() => {
    if (isPlaying) return;
    const actives = findActiveClipsAllTracks(tracksRef.current, currentTime);
    let pending = actives.length;
    for (const { clip, localTimeMs, trackIndex } of actives) {
      const track = getVideoTracks(tracksRef.current)[trackIndex];
      if (!track || !clip.blobUrl) { pending--; continue; }
      const vid = getTrackVideo(track.id);
      if (activeClipRef.current.get(track.id) !== clip.id) {
        vid.src = clip.blobUrl;
        activeClipRef.current.set(track.id, clip.id);
      }
      vid.currentTime = localTimeMs / 1000;
      const onSeeked = () => { vid.removeEventListener('seeked', onSeeked); pending--; if (pending <= 0) drawFrame(); };
      vid.addEventListener('seeked', onSeeked);
    }
    if (actives.length === 0) drawFrame();
    if (musicElRef.current) musicElRef.current.currentTime = currentTime / 1000;
  }, [currentTime, isPlaying, drawFrame, getTrackVideo, activeClipRef]);

  // --- Playback tick ---
  useEffect(() => {
    if (!isPlaying) return;
    let prevWall: number | null = null;
    let lastStoreUpdate: number | null = null;
    let id: number;
    const playingState = new Map<string, { clipId: string; trimStart: number; trimEnd: number }>();

    const tick = (wallMs: number) => {
      if (prevWall !== null) {
        const store = useEditorV2Store.getState();
        if (!store.isPlaying) return;
        const n = timeRef.current + (wallMs - prevWall);
        if (n >= store.duration) { store.setCurrentTime(0); store.setIsPlaying(false); timeRef.current = 0; return; }
        timeRef.current = n;
        if (!lastStoreUpdate || wallMs - lastStoreUpdate > 66) { store.setCurrentTime(n); lastStoreUpdate = wallMs; }

        // Audio fade on music
        const audioClip = store.tracks.find((t: Track) => t.type === 'audio')?.audioClips?.[0];
        if (audioClip) {
          const sec = n / 1000, durSec = store.duration / 1000;
          let mul = 1;
          if (audioClip.fadeIn > 0 && sec < audioClip.fadeIn) mul = sec / audioClip.fadeIn;
          if (audioClip.fadeOut > 0 && sec > durSec - audioClip.fadeOut) mul = Math.min(mul, (durSec - sec) / audioClip.fadeOut);
          setGain('music', audioVolumeRef.current * Math.max(0, Math.min(1, mul)));
        }

        // Per-track clip management
        const videoTracks = getVideoTracks(store.tracks);
        const activeNow = findActiveClipsAllTracks(store.tracks, n);
        const activeTrackIds = new Set<string>();

        for (const { clip, localTimeMs, trackIndex } of activeNow) {
          const track = videoTracks[trackIndex];
          if (!track || !clip.blobUrl) continue;
          activeTrackIds.add(track.id);
          const vid = videosRef.current.get(track.id);
          if (!vid) continue;

          const prev = playingState.get(track.id);
          const isNewClip = !prev || prev.clipId !== clip.id;
          const isTrimChanged = prev && prev.clipId === clip.id && (prev.trimStart !== clip.trimStart || prev.trimEnd !== clip.trimEnd);

          if (isNewClip || isTrimChanged) {
            if (isNewClip && activeClipRef.current.get(track.id) !== clip.id) {
              vid.src = clip.blobUrl;
              activeClipRef.current.set(track.id, clip.id);
            }
            vid.currentTime = localTimeMs / 1000;
            vid.play().catch(() => {}); // muted — image only
            // Restart audio from decoded buffer
            playClipAudio(track.id, clip.id, localTimeMs / 1000);
            setGain(track.id, (track.volume ?? 1) * voiceVolumeRef.current);
            playingState.set(track.id, { clipId: clip.id, trimStart: clip.trimStart, trimEnd: clip.trimEnd });
            console.log('[CLIP_PLAY]', track.id, clip.id.slice(0, 8), isNewClip ? 'new' : 'trim-changed');
          }
        }

        // Pause/stop tracks no longer active
        for (const [trackId] of playingState) {
          if (!activeTrackIds.has(trackId)) {
            videosRef.current.get(trackId)?.pause();
            stopTrackAudio(trackId);
            playingState.delete(trackId);
          }
        }

        // Update voice volume gains
        for (const track of videoTracks) {
          setGain(track.id, (track.volume ?? 1) * voiceVolumeRef.current);
        }
      }
      prevWall = wallMs;
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(id); playingState.clear(); stopAllClipAudio(); };
  }, [isPlaying, setGain, playClipAudio, stopTrackAudio, stopAllClipAudio, videosRef, activeClipRef]);

  // --- Render loops ---
  const rvfcActiveRef = useRef(new Set<string>());
  useEffect(() => {
    if (!isPlaying) { rvfcActiveRef.current.clear(); return; }
    const hasRVFC = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;
    if (!hasRVFC) return;
    for (const [trackId, vid] of videosRef.current) {
      if (rvfcActiveRef.current.has(trackId)) continue;
      rvfcActiveRef.current.add(trackId);
      const cb = () => {
        drawVideo();
        if (useEditorV2Store.getState().isPlaying && rvfcActiveRef.current.has(trackId)) {
          (vid as HTMLVideoElement & { requestVideoFrameCallback: (cb: () => void) => number }).requestVideoFrameCallback(cb);
        }
      };
      (vid as HTMLVideoElement & { requestVideoFrameCallback: (cb: () => void) => number }).requestVideoFrameCallback(cb);
    }
    return () => { rvfcActiveRef.current.clear(); };
  }, [isPlaying, drawVideo, videosRef]);

  useEffect(() => {
    let active = true;
    const hasRVFC = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;
    const loop = () => {
      if (!active) return;
      const playing = useEditorV2Store.getState().isPlaying;
      if (!playing || !hasRVFC) drawVideo();
      drawOverlay();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { active = false; cancelAnimationFrame(rafRef.current); };
  }, [drawVideo, drawOverlay]);

  // Visibility change
  useEffect(() => {
    const onVis = () => { if (document.visibilityState === 'visible') resumeAudio(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [resumeAudio]);

  // --- Event handlers (on overlay canvas — NOT modified) ---
  const handleDown = (e: React.MouseEvent | React.TouchEvent) => { const c = overlayCanvasRef.current; if (c) onDown(e, c); };
  const handleMove = (e: React.MouseEvent | React.TouchEvent) => { const c = overlayCanvasRef.current; if (c) onMove(e, c); };

  // --- JSX return (NOT modified — keep 2 canvas identical) ---
  return (
    <div className="relative h-full mx-auto" style={{ aspectRatio: '9/16', maxHeight: '100%', maxWidth: '100%' }}>
      <canvas ref={glCanvasRef} width={CANVAS_W} height={CANVAS_H} className="absolute inset-0 w-full h-full" />
      <canvas ref={overlayCanvasRef} width={CANVAS_W} height={CANVAS_H}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
        onMouseDown={handleDown} onMouseMove={handleMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={handleDown} onTouchMove={handleMove} onTouchEnd={onUp} />
    </div>
  );
}
