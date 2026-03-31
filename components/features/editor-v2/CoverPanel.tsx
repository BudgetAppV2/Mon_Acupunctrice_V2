'use client';

import { useRef, useEffect } from 'react';
import { useEditorV2Store, getVideoTrack } from '@/lib/store/useEditorV2Store';

export default function CoverPanel() {
  const { tracks, coverFrameMs, coverDataUrl, setCoverFrame, duration } = useEditorV2Store();
  const vidRef = useRef<HTMLVideoElement | null>(null);

  // Create hidden video element for frame capture
  useEffect(() => {
    const vt = getVideoTrack(tracks);
    const clip = vt?.clips?.[0];
    if (!clip?.blobUrl) return;
    const vid = document.createElement('video');
    vid.preload = 'auto'; vid.playsInline = true; vid.muted = true;
    vid.src = clip.blobUrl;
    vidRef.current = vid;
    return () => { vid.removeAttribute('src'); vid.load(); vidRef.current = null; };
  }, [tracks]);

  const captureFrame = (ms: number) => {
    const vid = vidRef.current;
    if (!vid || vid.readyState < 2) return;
    vid.currentTime = ms / 1000;
    vid.onseeked = () => {
      try {
        const c = document.createElement('canvas'); c.width = 270; c.height = 480;
        c.getContext('2d')!.drawImage(vid, 0, 0, 270, 480);
        const url = c.toDataURL('image/jpeg', 0.85);
        if (url.length > 100) setCoverFrame(ms, url);
      } catch { /* ignore */ }
      vid.onseeked = null;
    };
  };

  return (
    <div className="px-3 py-2 space-y-3">
      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Image de couverture</p>
      <div className="flex items-start gap-3">
        <div className="w-16 shrink-0 rounded-lg overflow-hidden bg-white/5" style={{ aspectRatio: '9/16' }}>
          {coverDataUrl ? (
            <img src={coverDataUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[9px] text-white/20">Aucune</div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-[10px] text-white/40">Choisis une frame de ta video</p>
          {duration > 0 && (
            <div>
              <label className="text-[9px] text-white/40">{(coverFrameMs / 1000).toFixed(1)}s</label>
              <input type="range" min={0} max={duration} step={100} value={coverFrameMs}
                onInput={e => captureFrame(+(e.target as HTMLInputElement).value)} onChange={() => {}}
                className="w-full accent-emerald-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
