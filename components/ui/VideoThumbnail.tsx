'use client';

import { useState, useRef, useEffect } from 'react';
import { VideoCameraIcon } from '@heroicons/react/24/outline';

interface Props {
  videoUrl: string;
  className?: string;
}

/**
 * Génère une miniature à partir d'une URL vidéo.
 * Utilise le trick play()/pause() pour forcer Safari iOS à décoder.
 */
export default function VideoThumbnail({ videoUrl, className = '' }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [thumb, setThumb] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const capture = () => {
      try {
        if (vid.readyState < 2 || vid.videoWidth === 0) return false;
        const cw = 270, ch = 480;
        const c = document.createElement('canvas');
        c.width = cw; c.height = ch;
        const ctx = c.getContext('2d')!;
        const { videoWidth: vw, videoHeight: vh } = vid;
        const va = vw / vh, ca = cw / ch;
        let sx = 0, sy = 0, sw = vw, sh = vh;
        if (va > ca) { sw = vh * ca; sx = (vw - sw) / 2; }
        else { sh = vw / ca; sy = (vh - sh) / 2; }
        ctx.drawImage(vid, sx, sy, sw, sh, 0, 0, cw, ch);
        const url = c.toDataURL('image/jpeg', 0.7);
        if (url !== 'data:,' && url.length > 100) { setThumb(url); return true; }
      } catch { /* cross-origin */ }
      return false;
    };

    // Safari iOS : play/pause priming pour forcer le décodage
    vid.onloadeddata = () => {
      vid.play().then(() => {
        vid.pause();
        if (!capture()) setTimeout(() => capture(), 300);
      }).catch(() => { /* play rejected */ });
    };
    vid.oncanplay = () => capture();

    const timeout = setTimeout(() => { if (!thumb) setFailed(true); }, 6000);
    return () => clearTimeout(timeout);
  }, [videoUrl]);

  // Proxy same-origin pour éviter le taint canvas
  const proxySrc = `/api/proxy-video?url=${encodeURIComponent(videoUrl)}`;

  if (thumb) return <img src={thumb} alt="" className={`object-cover ${className}`} />;

  return (
    <>
      <video ref={videoRef} src={proxySrc} className="absolute w-px h-px opacity-0 pointer-events-none" playsInline muted preload="auto" />
      <div className={`bg-gray-100 flex items-center justify-center gap-2 ${className}`}>
        {failed ? (
          <>
            <VideoCameraIcon className="w-6 h-6 text-sage" />
            <span className="text-sm text-gray-500">Video prete</span>
          </>
        ) : (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sage" />
        )}
      </div>
    </>
  );
}
