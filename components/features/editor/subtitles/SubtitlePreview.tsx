'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';
import { getTheme, getThemePalette } from '@/lib/data/videoThemes';

/** Affiche le sous-titre courant sur la preview video (6 styles) */
export default function SubtitlePreview() {
  const { subtitles, subtitleStyle, currentTime, activeThemeId } = useEditorStore();
  const seg = subtitles.find(s => currentTime >= s.startTime && currentTime <= s.endTime);
  if (!seg) return null;

  const palette = getThemePalette(getTheme(activeThemeId));
  const stroke = '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000';
  const base = 'absolute bottom-16 left-2 right-2 z-10 flex justify-center pointer-events-none';

  if (subtitleStyle === 'bold_outline') {
    return (
      <div className={base}>
        <p className="text-white text-center text-xl font-black leading-tight"
          style={{ textShadow: '-3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000', WebkitTextStroke: '2px #000' }}>
          {seg.text}
        </p>
      </div>
    );
  }

  if (subtitleStyle === 'pill') {
    return (
      <div className={base}>
        <p className="text-center text-lg font-bold leading-tight px-4 py-1.5 rounded-xl"
          style={{ backgroundColor: palette.background, color: palette.text }}>
          {seg.text}
        </p>
      </div>
    );
  }

  if (subtitleStyle === 'karaoke_pro') {
    return (
      <div className={base}>
        <p className="text-center text-lg font-bold leading-tight" style={{ textShadow: stroke }}>
          {seg.words.map(w => {
            const active = currentTime >= w.start && currentTime <= w.end;
            return (
              <span key={`${w.start}-${w.word}`}
                style={{ color: active ? palette.accent : '#fff', transform: active ? 'scale(1.1)' : 'none', display: 'inline-block', transition: 'all 0.1s' }}>
                {w.word}{' '}
              </span>
            );
          })}
        </p>
      </div>
    );
  }

  if (subtitleStyle === 'tiktok') {
    return (
      <div className={base}>
        <p className="text-center text-lg font-bold leading-tight" style={{ textShadow: stroke }}>
          {seg.words.map(w => {
            const active = currentTime >= w.start && currentTime <= w.end;
            return <span key={`${w.start}-${w.word}`} className={active ? 'text-yellow-400' : 'text-white'}>{w.word}{' '}</span>;
          })}
        </p>
      </div>
    );
  }

  if (subtitleStyle === 'karaoke') {
    return (
      <div className={base}>
        <p className="bg-green-700/70 px-3 py-1 rounded-lg text-white text-center text-lg font-bold">{seg.text}</p>
      </div>
    );
  }

  // classic
  return (
    <div className={base}>
      <p className="text-white text-center text-lg font-bold leading-tight" style={{ textShadow: stroke }}>{seg.text}</p>
    </div>
  );
}
