'use client';

import { useState, useRef, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseStorage, getFirebaseAuth } from '@/lib/firebase';
import { PhotoIcon } from '@heroicons/react/24/outline';

type CoverSelection = { type: 'frame'; offset: number } | { type: 'custom'; url: string };

interface Props {
  videoUrl: string;
  value: CoverSelection;
  onChange: (v: CoverSelection) => void;
  fallbackThumbnail?: string;
}

export default function CoverPicker({ videoUrl, value, onChange, fallbackThumbnail }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [framePreview, setFramePreview] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(30);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [captureFailed, setCaptureFailed] = useState(false);

  const captureFrame = async (vid: HTMLVideoElement) => {
    try {
      if (vid.readyState < 2 || vid.videoWidth === 0) return;
      const cw = 270, ch = 480;
      const c = document.createElement('canvas');
      c.width = cw; c.height = ch;
      const ctx = c.getContext('2d')!;
      const { videoWidth: vw, videoHeight: vh } = vid;
      const va = vw / vh, ca = cw / ch;
      let sx = 0, sy = 0, sw = vw, sh = vh;
      if (va > ca) { sw = vh * ca; sx = (vw - sw) / 2; }
      else { sh = vw / ca; sy = (vh - sh) / 2; }
      // Safari iOS : createImageBitmap est plus fiable que drawImage direct
      if (typeof createImageBitmap !== 'undefined') {
        const bitmap = await createImageBitmap(vid, sx, sy, sw, sh);
        ctx.drawImage(bitmap, 0, 0, cw, ch);
        bitmap.close();
      } else {
        ctx.drawImage(vid, sx, sy, sw, sh, 0, 0, cw, ch);
      }
      const url = c.toDataURL('image/jpeg', 0.8);
      if (url !== 'data:,' && url.length > 100) setFramePreview(url);
    } catch { /* cross-origin — placeholder */ }
  };

  // Charger la vidéo et mesurer la durée
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    setLoading(true);
    vid.onloadedmetadata = () => {
      if (vid.duration && isFinite(vid.duration)) setVideoDuration(vid.duration);
    };
    vid.oncanplay = () => {
      setLoading(false);
      captureFrame(vid);
    };
    // Safari iOS : forcer le décodage avec play()+pause() ("priming")
    // Safari refuse de décoder les frames sans un play() initial
    vid.onloadeddata = () => {
      vid.play().then(() => {
        vid.pause();
        setLoading(false);
        captureFrame(vid);
      }).catch(() => { /* play() rejected — expected on some browsers */ });
    };
    // Polling fallback
    const interval = setInterval(() => {
      if (vid.readyState >= 2) {
        setLoading(false);
        captureFrame(vid);
        if (vid.duration && isFinite(vid.duration)) setVideoDuration(vid.duration);
        clearInterval(interval);
      }
    }, 500);
    const timeout = setTimeout(() => { clearInterval(interval); setLoading(false); setCaptureFailed(true); }, 8000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [videoUrl]);

  // Capturer la frame à l'offset sélectionné via le slider
  const frameOffset = value.type === 'frame' ? value.offset : null;
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || frameOffset === null) return;
    const targetTime = frameOffset / 1000;
    vid.currentTime = targetTime;

    const handler = () => setTimeout(() => captureFrame(vid), 150);
    vid.addEventListener('seeked', handler, { once: true });
    // Safari iOS: si readyState < 2 après seek, forcer play/pause
    setTimeout(() => {
      if (vid.readyState < 2) {
        vid.play().then(() => {
          vid.pause();
          vid.currentTime = targetTime;
          setTimeout(() => captureFrame(vid), 300);
        }).catch(() => captureFrame(vid));
      } else {
        vid.removeEventListener('seeked', handler);
        captureFrame(vid);
      }
    }, 600);
  }, [frameOffset]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const userId = getFirebaseAuth().currentUser?.uid;
      const storage = getFirebaseStorage();
      const coverRef = ref(storage, `covers/${userId}/${Date.now()}.jpg`);
      await uploadBytes(coverRef, file, { contentType: 'image/jpeg' });
      const url = await getDownloadURL(coverRef);
      onChange({ type: 'custom', url });
    } finally { setUploading(false); }
  };

  // Proxy same-origin pour éviter le taint canvas cross-origin sur Safari
  const videoSrc = `/api/proxy-video?url=${encodeURIComponent(videoUrl)}`;

  return (
    <div className="space-y-3">
      {/* Video element — pas hidden (Safari iOS refuse de decoder les videos hidden) */}
      <video ref={videoRef} src={videoSrc} className="absolute w-px h-px opacity-0 pointer-events-none" playsInline muted preload="auto" />

      {/* Preview de la couverture */}
      <div className="flex flex-col items-center gap-1">
        {value.type === 'custom' ? (
          <img src={value.url} alt="" className="rounded-lg" style={{ width: 128, aspectRatio: '9/16', objectFit: 'cover' }} />
        ) : loading ? (
          <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ width: 128, aspectRatio: '9/16' }}>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sage" />
          </div>
        ) : (framePreview || fallbackThumbnail) ? (
          <img src={(framePreview || fallbackThumbnail)!} alt="" className="rounded-lg" style={{ width: 128, aspectRatio: '9/16', objectFit: 'cover' }} />
        ) : (
          <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ width: 128, aspectRatio: '9/16' }}>
            <PhotoIcon className="w-8 h-8 text-gray-300" />
          </div>
        )}
        {captureFailed && !framePreview && (
          <p className="text-[10px] text-gray-400 text-center max-w-[200px]">
            Utilisez Depuis Photos pour choisir une image personnalisee
          </p>
        )}
      </div>

      {/* Scrubber de frame */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">
          {value.type === 'frame' ? `Frame a ${(value.offset / 1000).toFixed(1)}s` : 'Image personnalisee'}
        </label>
        <input
          type="range" min={0} max={videoDuration * 1000} step={100}
          value={value.type === 'frame' ? value.offset : 0}
          onChange={e => onChange({ type: 'frame', offset: +e.target.value })}
          className="w-full accent-sage"
        />
      </div>

      {/* Upload image custom */}
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="w-full py-2 border border-gray-200 rounded-lg text-sm text-gray-700 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <PhotoIcon className="w-4 h-4" />
        {uploading ? 'Upload...' : 'Depuis Photos'}
      </button>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
    </div>
  );
}
