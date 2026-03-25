'use client';

import { useRef, useEffect, useCallback } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseStorage, getFirebaseAuth } from '@/lib/firebase';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { PhotoIcon } from '@heroicons/react/24/outline';

export default function CoverPanel() {
  const { videoUrl, duration, coverFrameOffset, coverDataUrl, coverCustomUrl, setCoverFrame, setCoverCustom } = useEditorStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Video element invisible pour la capture de frame
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !videoUrl) return;
    vid.src = videoUrl;
  }, [videoUrl]);

  const captureFrame = useCallback(async () => {
    const vid = videoRef.current;
    if (!vid || vid.readyState < 2 || vid.videoWidth === 0) return;
    try {
      const cw = 270, ch = 480, c = document.createElement('canvas');
      c.width = cw; c.height = ch;
      const ctx = c.getContext('2d')!;
      const { videoWidth: vw, videoHeight: vh } = vid;
      const va = vw / vh, ca = cw / ch;
      let sx = 0, sy = 0, sw = vw, sh = vh;
      if (va > ca) { sw = vh * ca; sx = (vw - sw) / 2; }
      else { sh = vw / ca; sy = (vh - sh) / 2; }
      if (typeof createImageBitmap !== 'undefined') {
        const bmp = await createImageBitmap(vid, sx, sy, sw, sh);
        ctx.drawImage(bmp, 0, 0, cw, ch); bmp.close();
      } else { ctx.drawImage(vid, sx, sy, sw, sh, 0, 0, cw, ch); }
      const url = c.toDataURL('image/jpeg', 0.8);
      if (url !== 'data:,' && url.length > 100) setCoverFrame(Math.round(vid.currentTime * 1000), url);
    } catch { /* capture echouee */ }
  }, [setCoverFrame]);

  // Debounce seek (200ms) quand le slider change
  const handleSliderChange = useCallback((ms: number) => {
    const vid = videoRef.current;
    if (!vid) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      vid.currentTime = ms / 1000;
      vid.addEventListener('seeked', () => setTimeout(captureFrame, 100), { once: true });
    }, 200);
    // Aussi seek la preview principale en temps reel
    useEditorStore.getState().seekTo(ms / 1000);
  }, [captureFrame]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const userId = getFirebaseAuth().currentUser?.uid;
      const coverRef = ref(getFirebaseStorage(), `covers/${userId}/${Date.now()}.jpg`);
      await uploadBytes(coverRef, file, { contentType: 'image/jpeg' });
      setCoverCustom(await getDownloadURL(coverRef));
    } catch { /* upload echoue */ }
  };

  const preview = coverCustomUrl || coverDataUrl;
  const step = duration > 60 ? 500 : 100;

  return (
    <div className="px-3 py-2 flex items-start gap-3">
      <video ref={videoRef} className="hidden" playsInline muted preload="auto" />

      {/* Vignette preview */}
      <div className="shrink-0">
        {preview ? (
          <img src={preview} alt="" className="rounded-lg" style={{ width: 64, aspectRatio: '9/16', objectFit: 'cover' }} />
        ) : (
          <div className="bg-gray-800 rounded-lg flex items-center justify-center" style={{ width: 64, aspectRatio: '9/16' }}>
            <PhotoIcon className="w-5 h-5 text-gray-500" />
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="flex-1 space-y-2">
        <label className="text-xs text-gray-400">
          {coverCustomUrl ? 'Image personnalisee' : `Frame a ${(coverFrameOffset / 1000).toFixed(1)}s`}
        </label>
        <input type="range" min={0} max={Math.round(duration * 1000)} step={step}
          value={coverFrameOffset}
          onChange={e => handleSliderChange(+e.target.value)}
          className="w-full accent-sage" />
        <button onClick={() => fileRef.current?.click()}
          className="text-xs text-gray-400 border border-gray-700 rounded px-2 py-1 hover:text-white transition">
          <PhotoIcon className="w-3 h-3 inline mr-1" />Depuis Photos
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      </div>
    </div>
  );
}
