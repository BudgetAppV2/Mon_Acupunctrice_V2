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
}

export default function CoverPicker({ videoUrl, value, onChange }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [framePreview, setFramePreview] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(30);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const captureFrame = (vid: HTMLVideoElement) => {
    try {
      if (vid.readyState < 2 || vid.videoWidth === 0) return;
      const cw = 270, ch = 480;
      const c = document.createElement('canvas');
      c.width = cw; c.height = ch;
      // Crop center (object-cover) — cohérent avec l'export
      const { videoWidth: vw, videoHeight: vh } = vid;
      const va = vw / vh, ca = cw / ch;
      let sx = 0, sy = 0, sw = vw, sh = vh;
      if (va > ca) { sw = vh * ca; sx = (vw - sw) / 2; }
      else { sh = vw / ca; sy = (vh - sh) / 2; }
      c.getContext('2d')!.drawImage(vid, sx, sy, sw, sh, 0, 0, cw, ch);
      const url = c.toDataURL('image/jpeg', 0.8);
      if (url !== 'data:,' && url.length > 100) setFramePreview(url);
    } catch { /* cross-origin — will show placeholder */ }
  };

  // Charger la vidéo et mesurer la durée
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    setLoading(true);
    vid.onloadedmetadata = () => {
      if (vid.duration && isFinite(vid.duration)) setVideoDuration(vid.duration);
    };
    vid.oncanplay = () => { setLoading(false); captureFrame(vid); };
  }, [videoUrl]);

  // Capturer la frame à l'offset sélectionné via le slider
  const frameOffset = value.type === 'frame' ? value.offset : null;
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || frameOffset === null) return;
    vid.onseeked = () => captureFrame(vid);
    vid.currentTime = frameOffset / 1000;
    setTimeout(() => captureFrame(vid), 300);
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
      <video ref={videoRef} src={videoSrc} className="hidden" playsInline muted preload="auto" />

      {/* Preview de la couverture */}
      <div className="flex justify-center">
        {value.type === 'custom' ? (
          <img src={value.url} alt="" className="w-32 h-56 object-cover rounded-lg" />
        ) : loading ? (
          <div className="w-32 h-56 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sage" />
          </div>
        ) : framePreview ? (
          <img src={framePreview} alt="" className="w-32 h-56 object-cover rounded-lg" />
        ) : (
          <div className="w-32 h-56 bg-gray-100 rounded-lg flex items-center justify-center">
            <PhotoIcon className="w-8 h-8 text-gray-300" />
          </div>
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
