'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';

/** Affiche le sous-titre courant sur la preview vidéo (3 styles) */
export default function SubtitlePreview() {
  const { subtitles, subtitleStyle, currentTime } = useEditorStore();

  const seg = subtitles.find(s => currentTime >= s.startTime && currentTime <= s.endTime);
  if (!seg) return null;

  const stroke = '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000';

  if (subtitleStyle === 'tiktok') {
    return (
      <div className="absolute bottom-16 left-2 right-2 z-10 flex justify-center pointer-events-none">
        <p className="text-center text-lg font-bold leading-tight" style={{ textShadow: stroke }}>
          {seg.words.map(w => {
            const active = currentTime >= w.start && currentTime <= w.end;
            return (
              <span key={`${w.start}-${w.word}`} className={active ? 'text-yellow-400' : 'text-white'}>
                {w.word}{' '}
              </span>
            );
          })}
        </p>
      </div>
    );
  }

  if (subtitleStyle === 'karaoke') {
    return (
      <div className="absolute bottom-16 left-2 right-2 z-10 flex justify-center pointer-events-none">
        <p className="bg-green-700/70 px-3 py-1 rounded-lg text-white text-center text-lg font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
          {seg.text}
        </p>
      </div>
    );
  }

  return (
    <div className="absolute bottom-16 left-2 right-2 z-10 flex justify-center pointer-events-none">
      <p className="text-white text-center text-lg font-bold leading-tight" style={{ textShadow: stroke }}>
        {seg.text}
      </p>
    </div>
  );
}
