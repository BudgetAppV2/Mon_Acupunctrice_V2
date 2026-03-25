'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseStorage, getFirebaseAuth } from '@/lib/firebase';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { PhotoIcon } from '@heroicons/react/24/outline';

type CoverSelection = { type: 'frame'; offset: number } | { type: 'custom'; url: string };

interface Props {
  videoUrl: string;
  value: CoverSelection;
  onChange: (v: CoverSelection) => void;
  fallbackThumbnail?: string;
  onFrameCapture?: (dataUrl: string) => void;
}

export default function CoverPicker({ videoUrl, value, onChange, fallbackThumbnail, onFrameCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [framePreview, setFramePreview] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(30);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Blob URL du store = deja en memoire, seek instantane, pas de re-telechargement
  const storeBlobUrl = useEditorStore.getState().videoUrl;
  const videoSrc = storeBlobUrl || `/api/proxy-video?url=${encodeURIComponent(videoUrl)}`;

  const captureFrame = useCallback(async (vid: HTMLVideoElement) => {
    try {
      if (vid.readyState < 2 || vid.videoWidth === 0) return;
      const cw = 270, ch = 480, c = document.createElement('canvas');
      c.width = cw; c.height = ch;
      const ctx = c.getContext('2d')!;
      const { videoWidth: vw, videoHeight: vh } = vid;
      const va = vw / vh, ca = cw / ch;
      let sx = 0, sy = 0, sw = vw, sh = vh;
      if (va > ca) { sw = vh * ca; sx = (vw - sw) / 2; }
      else { sh = vw / ca; sy = (vh - sh) / 2; }
      if (typeof createImageBitmap !== 'undefined') {
        const bitmap = await createImageBitmap(vid, sx, sy, sw, sh);
        ctx.drawImage(bitmap, 0, 0, cw, ch); bitmap.close();
      } else { ctx.drawImage(vid, sx, sy, sw, sh, 0, 0, cw, ch); }
      const url = c.toDataURL('image/jpeg', 0.8);
      if (url !== 'data:,' && url.length > 100) { setFramePreview(url); onFrameCapture?.(url); }
    } catch { /* decode echoue */ }
  }, [onFrameCapture]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    setLoading(true);
    vid.onloadedmetadata = () => { if (vid.duration && isFinite(vid.duration)) setVideoDuration(vid.duration); };
    vid.oncanplay = () => { setLoading(false); captureFrame(vid); };
    if (!storeBlobUrl) {
      vid.onloadeddata = () => { vid.play().then(() => { vid.pause(); setLoading(false); captureFrame(vid); }).catch(() => {}); };
    }
    const interval = setInterval(() => {
      if (vid.readyState >= 2) { setLoading(false); captureFrame(vid); if (vid.duration && isFinite(vid.duration)) setVideoDuration(vid.duration); clearInterval(interval); }
    }, 500);
    const timeout = setTimeout(() => { clearInterval(interval); setLoading(false); }, 8000);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [videoSrc, storeBlobUrl, captureFrame]);

  // Seek debounce (200ms) pour slider fluide sur longues videos
  const frameOffset = value.type === 'frame' ? value.offset : null;
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || frameOffset === null) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      vid.currentTime = frameOffset / 1000;
      vid.addEventListener('seeked', () => setTimeout(() => captureFrame(vid), 100), { once: true });
    }, 200);
  }, [frameOffset, captureFrame]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const userId = getFirebaseAuth().currentUser?.uid;
      const coverRef = ref(getFirebaseStorage(), `covers/${userId}/${Date.now()}.jpg`);
      await uploadBytes(coverRef, file, { contentType: 'image/jpeg' });
      onChange({ type: 'custom', url: await getDownloadURL(coverRef) });
    } finally { setUploading(false); }
  };

  return (
    <div className="space-y-3">
      <video ref={videoRef} src={videoSrc} className="absolute w-px h-px opacity-0 pointer-events-none" playsInline muted preload="auto" />
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
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">
          {value.type === 'frame' ? `Frame a ${(value.offset / 1000).toFixed(1)}s` : 'Image personnalisee'}
        </label>
        <input type="range" min={0} max={videoDuration * 1000} step={videoDuration > 60 ? 500 : 100}
          value={value.type === 'frame' ? value.offset : 0}
          onChange={e => onChange({ type: 'frame', offset: +e.target.value })} className="w-full accent-sage" />
      </div>
      <button onClick={() => fileRef.current?.click()} disabled={uploading}
        className="w-full py-2 border border-gray-200 rounded-lg text-sm text-gray-700 flex items-center justify-center gap-2 disabled:opacity-50">
        <PhotoIcon className="w-4 h-4" /> {uploading ? 'Upload...' : 'Depuis Photos'}
      </button>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
    </div>
  );
}
