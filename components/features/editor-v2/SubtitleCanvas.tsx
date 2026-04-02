'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useEditorV2Store, getVideoTrack, getVideoTracks } from '@/lib/store/useEditorV2Store';
import { renderFrame } from '@/lib/editor-v2/renderer';
import { FILTERS } from '@/lib/editor-v2/filters';
import { CANVAS_W, CANVAS_H, findActiveClipsAllTracks, getFirstAudioUrl, createVideoElement } from '@/lib/editor-v2/playback';
import { useSubtitleDrag } from '@/lib/editor-v2/useSubtitleDrag';
import { initWebGL, renderVideoFrame, destroyWebGL, cssFilterToUniforms, IDENTITY_UNIFORMS } from '@/lib/editor-v2/webglRenderer';
import type { Track } from '@/lib/editor-v2/types';

// --- Web Audio Engine ---
// One AudioContext, one MediaElementSource+GainNode per source (video tracks + music)

interface AudioEngine {
  ctx: AudioContext;
  gains: Map<string, GainNode>; // trackId → GainNode
  sources: Map<string, MediaElementAudioSourceNode>; // trackId → source (created once per element)
}

function useAudioEngine() {
  const engineRef = useRef<AudioEngine | null>(null);

  const getOrCreateEngine = useCallback((): AudioEngine => {
    if (engineRef.current) return engineRef.current;
    const ctx = new AudioContext();
    engineRef.current = { ctx, gains: new Map(), sources: new Map() };
    console.log('[AUDIO_ENGINE] Created AudioContext, state:', ctx.state);
    return engineRef.current;
  }, []);

  const connectElement = useCallback((trackId: string, el: HTMLMediaElement) => {
    const engine = getOrCreateEngine();
    // createMediaElementSource can only be called ONCE per element
    if (engine.sources.has(trackId)) return engine.gains.get(trackId)!;
    const source = engine.ctx.createMediaElementSource(el);
    const gain = engine.ctx.createGain();
    source.connect(gain).connect(engine.ctx.destination);
    engine.sources.set(trackId, source);
    engine.gains.set(trackId, gain);
    console.log('[AUDIO_ENGINE] Connected', trackId, '→ GainNode → destination');
    return gain;
  }, [getOrCreateEngine]);

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
      engineRef.current.ctx.close().catch(() => {});
      engineRef.current = null;
    }
  }, []);

  // Resume AudioContext on ANY user gesture (required by Safari iOS)
  // Must be in the synchronous call stack of touchstart/click — not in a useEffect reaction
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
    return () => {
      document.removeEventListener('touchstart', handleGesture);
      document.removeEventListener('click', handleGesture);
    };
  }, []);

  return { connectElement, setGain, resume, cleanup, engineRef };
}

// --- Per-track video elements (1 <video> per track, swap src on clip change) ---

function useTrackVideos() {
  const videosRef = useRef<Map<string, HTMLVideoElement>>(new Map());
  const activeClipRef = useRef<Map<string, string>>(new Map()); // trackId → current clipId

  const getOrCreate = useCallback((trackId: string): HTMLVideoElement => {
    let vid = videosRef.current.get(trackId);
    if (vid) return vid;
    vid = createVideoElement();
    videosRef.current.set(trackId, vid);
    return vid;
  }, []);

  const cleanup = useCallback(() => {
    for (const vid of videosRef.current.values()) {
      vid.pause(); vid.removeAttribute('src'); vid.load();
    }
    videosRef.current.clear();
    activeClipRef.current.clear();
  }, []);

  return { getOrCreate, videosRef, activeClipRef, cleanup };
}

// --- Main Component ---

export default function SubtitleCanvas() {
  // Build markers — keep for deploy verification
  useEffect(() => { console.log('[EDITOR_V2] build:2026-04-02T22:30 — trim-detect-map + audio-mix'); }, []);
  useEffect(() => { console.log('[EDITOR_V2] v12 — trim Map, vid.muted=false, voiceVolume slider'); }, []);
  useEffect(() => { console.log('[EDITOR_V2] M1 — per-track videos + Web Audio API'); }, []);

  const glCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const musicElRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number>(0);
  const glInitRef = useRef(false);

  const { getOrCreate: getTrackVideo, videosRef, activeClipRef, cleanup: cleanupVideos } = useTrackVideos();
  const { connectElement, setGain, resume: resumeAudio, cleanup: cleanupAudio, engineRef } = useAudioEngine();

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

  // Cleanup on unmount
  useEffect(() => () => { cleanupVideos(); cleanupAudio(); }, [cleanupVideos, cleanupAudio]);

  // --- Music element ---
  useEffect(() => {
    const url = getFirstAudioUrl(tracks);
    if (url) {
      if (!musicElRef.current) { musicElRef.current = new Audio(); musicElRef.current.loop = true; }
      if (musicElRef.current.src !== url) musicElRef.current.src = url;
      connectElement('music', musicElRef.current);
    } else if (musicElRef.current) {
      musicElRef.current.pause(); musicElRef.current.removeAttribute('src');
      musicElRef.current = null;
    }
  }, [tracks, connectElement]);

  // --- Init first clip metadata + thumbnail ---
  useEffect(() => {
    if (!videoUrl) return;
    const firstTrack = getVideoTrack(useEditorV2Store.getState().tracks);
    const firstClipId = firstTrack?.clips?.[0]?.id ?? null;
    if (!firstClipId || !firstTrack) return;
    const vid = getTrackVideo(firstTrack.id);
    vid.src = videoUrl;
    activeClipRef.current.set(firstTrack.id, firstClipId);
    connectElement(firstTrack.id, vid);
    const onMeta = () => {
      if (vid.duration && isFinite(vid.duration)) {
        const dMs = vid.duration * 1000;
        const store = useEditorV2Store.getState();
        store.setDuration(dMs);
        store.initClipDuration(firstClipId, dMs);
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
  }, [videoUrl, getTrackVideo, connectElement, activeClipRef]);

  // --- Pre-load video elements for additional tracks ---
  useEffect(() => {
    for (const t of getVideoTracks(tracks)) {
      if (!videosRef.current.has(t.id) && t.clips?.length) {
        const firstClip = t.clips[0];
        if (firstClip.blobUrl) {
          const vid = getTrackVideo(t.id);
          vid.src = firstClip.blobUrl;
          activeClipRef.current.set(t.id, firstClip.id);
          connectElement(t.id, vid);
          if (firstClip.duration === 0) {
            const cid = firstClip.id;
            vid.addEventListener('loadedmetadata', () => {
              if (vid.duration && isFinite(vid.duration)) useEditorV2Store.getState().initClipDuration(cid, vid.duration * 1000);
            }, { once: true });
          }
        }
      }
    }
  }, [tracks, getTrackVideo, connectElement, videosRef, activeClipRef]);

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
        // Painter's algorithm: last drawn = on top (track 0 drawn last = on top)
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
  useEffect(() => {
    if (isPlaying && !prevPlayingRef.current) {
      // Resume AudioContext FIRST (required by iOS on user gesture), then play
      console.log('[AUDIO_ENGINE] Play pressed, ctx state:', engineRef.current?.ctx.state ?? 'no engine');
      resumeAudio().then(() => {
        console.log('[AUDIO_ENGINE] After resume in play effect, ctx state:', engineRef.current?.ctx.state);
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
          vid.muted = false;
          vid.play().catch(() => {});
          setGain(track.id, (track.volume ?? 1) * voiceVolumeRef.current);
        }
        if (musicElRef.current) {
          musicElRef.current.currentTime = t / 1000;
          musicElRef.current.muted = false;
          musicElRef.current.play().catch(() => {});
          setGain('music', audioVolumeRef.current);
        }
      });
    } else if (!isPlaying) {
      for (const vid of videosRef.current.values()) vid.pause();
      if (musicElRef.current) musicElRef.current.pause();
    }
    prevPlayingRef.current = isPlaying;
  }, [isPlaying, getTrackVideo, resumeAudio, setGain, videosRef, activeClipRef]);

  // --- Scrub (paused): seek all active clips + redraw ---
  useEffect(() => {
    if (isPlaying) return;
    const allTracks = tracksRef.current;
    const actives = findActiveClipsAllTracks(allTracks, currentTime);
    let pending = actives.length;

    for (const { clip, localTimeMs, trackIndex } of actives) {
      const track = getVideoTracks(allTracks)[trackIndex];
      if (!track || !clip.blobUrl) { pending--; continue; }
      const vid = getTrackVideo(track.id);
      // Swap source if needed
      if (activeClipRef.current.get(track.id) !== clip.id) {
        vid.src = clip.blobUrl;
        activeClipRef.current.set(track.id, clip.id);
      }
      vid.currentTime = localTimeMs / 1000;
      const onSeeked = () => { vid.removeEventListener('seeked', onSeeked); pending--; if (pending <= 0) drawFrame(); };
      vid.addEventListener('seeked', onSeeked);
    }
    if (actives.length === 0) drawFrame();
    // Sync music scrub
    if (musicElRef.current) musicElRef.current.currentTime = currentTime / 1000;
  }, [currentTime, isPlaying, drawFrame, getTrackVideo, activeClipRef]);

  // --- Playback tick: wall clock + clip-switch + trim surveillance + audio fade ---
  useEffect(() => {
    if (!isPlaying) return;
    let prevWall: number | null = null;
    let lastStoreUpdate: number | null = null;
    let id: number;
    // Map trackId → { clipId, trimStart, trimEnd } for clip-switch & trim detection
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
            // Clip switch or trim changed — swap source + seek + play
            if (isNewClip && activeClipRef.current.get(track.id) !== clip.id) {
              vid.src = clip.blobUrl;
              activeClipRef.current.set(track.id, clip.id);
            }
            vid.currentTime = localTimeMs / 1000;
            vid.muted = false;
            vid.play().catch(() => {});
            setGain(track.id, (track.volume ?? 1) * voiceVolumeRef.current);
            playingState.set(track.id, { clipId: clip.id, trimStart: clip.trimStart, trimEnd: clip.trimEnd });
            console.log('[CLIP_PLAY]', track.id, clip.id.slice(0, 8), isNewClip ? 'new' : 'trim-changed');
          }
          // NO seek if same clip with same trim — avoid Safari stutter
        }

        // Pause tracks no longer active
        for (const [trackId] of playingState) {
          if (!activeTrackIds.has(trackId)) {
            videosRef.current.get(trackId)?.pause();
            playingState.delete(trackId);
          }
        }

        // Update voice volume gains — apply voiceVolume × track.volume
        for (const track of videoTracks) {
          setGain(track.id, (track.volume ?? 1) * voiceVolumeRef.current);
        }
      }
      prevWall = wallMs;
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(id); playingState.clear(); };
  }, [isPlaying, setGain, videosRef, activeClipRef]);

  // --- Render loops ---
  // rVFC: WebGL video redraw synced to video decoder (playing only)
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

  // RAF: overlays at 60fps + fallback video when paused or no rVFC
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

  // --- Visibility change: re-resume AudioContext ---
  useEffect(() => {
    const onVisChange = () => { if (document.visibilityState === 'visible') resumeAudio(); };
    document.addEventListener('visibilitychange', onVisChange);
    return () => document.removeEventListener('visibilitychange', onVisChange);
  }, [resumeAudio]);

  // --- Event handlers (on overlay canvas — NOT modified per M1 plan) ---
  const handleDown = (e: React.MouseEvent | React.TouchEvent) => { const c = overlayCanvasRef.current; if (c) onDown(e, c); };
  const handleMove = (e: React.MouseEvent | React.TouchEvent) => { const c = overlayCanvasRef.current; if (c) onMove(e, c); };

  // --- JSX return (NOT modified per M1 plan — keep 2 canvas identical) ---
  return (
    <div className="relative h-full mx-auto" style={{ aspectRatio: '9/16', maxHeight: '100%', maxWidth: '100%' }}>
      {/* WebGL canvas — video + GPU filters */}
      <canvas ref={glCanvasRef} width={CANVAS_W} height={CANVAS_H}
        className="absolute inset-0 w-full h-full" />

      {/* 2D overlay canvas — subtitles + text overlays (transparent) */}
      <canvas ref={overlayCanvasRef} width={CANVAS_W} height={CANVAS_H}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
        onMouseDown={handleDown} onMouseMove={handleMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={handleDown} onTouchMove={handleMove} onTouchEnd={onUp} />
    </div>
  );
}
