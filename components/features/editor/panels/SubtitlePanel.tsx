'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';
import { useTranscription } from '@/lib/hooks/useTranscription';
import type { SubtitleStyle, SubtitleFamily } from '@/lib/types';
import { SparklesIcon } from '@heroicons/react/24/outline';
import SubtitlePositionPicker from './SubtitlePositionPicker';

const FAMILIES: { id: SubtitleFamily; label: string }[] = [
  { id: 'narratif', label: 'Narratif' },
  { id: 'boldHighlight', label: 'Bold' },
  { id: 'minimalWellness', label: 'Doux' },
];

const ANIMATIONS: { id: 'fade' | 'slide-up' | 'slide-left' | 'pop' | 'none'; label: string }[] = [
  { id: 'fade', label: 'Fade' },
  { id: 'slide-up', label: 'Haut' },
  { id: 'slide-left', label: 'Gauche' },
  { id: 'pop', label: 'Pop' },
  { id: 'none', label: 'Aucune' },
];

const V1_STYLES: { id: SubtitleStyle; label: string }[] = [
  { id: 'classic', label: 'Classique' },
  { id: 'bold_outline', label: 'Bold' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'pill', label: 'Pill' },
  { id: 'karaoke', label: 'Karaoke' },
  { id: 'karaoke_pro', label: 'Karaoke Pro' },
];

export default function SubtitlePanel() {
  const {
    subtitles, subtitleStyle, subtitleFamily,
    subtitlePosition, subtitleAnimation,
    setSubtitles, setSubtitleStyle, updateSubtitle,
    setSubtitleFamily, setSubtitlePosition, setSubtitleAnimation, videoFile,
  } = useEditorStore();
  const { transcribe, loading, stage, error } = useTranscription();

  const handleGenerate = async () => {
    if (!videoFile) return;
    const segs = await transcribe(videoFile);
    if (segs.length > 0) setSubtitles(segs);
  };
  return (
    <div className="px-3 py-2 space-y-3">
      {/* Bouton auto-generer */}
      <button
        onClick={handleGenerate}
        disabled={loading || !videoFile}
        className="w-full flex items-center justify-center gap-2 py-2 bg-sage text-white rounded-lg text-sm font-medium disabled:opacity-50"
      >
        <SparklesIcon className="w-4 h-4" />
        {stage === 'extracting' ? 'Extraction audio...' : stage === 'uploading' ? 'Envoi...' : stage === 'transcribing' ? 'Transcription...' : 'Auto-generer'}
      </button>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {subtitles.length > 0 && (
        <>
          {/* Familles Pro */}
          <div>
            <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">Style Pro</p>
            <div className="flex gap-1.5">
              {FAMILIES.map(f => (
                <button
                  key={f.id}
                  onClick={() => setSubtitleFamily(subtitleFamily === f.id ? null : f.id)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition ${
                    subtitleFamily === f.id
                      ? 'border-sage bg-sage/20 text-white'
                      : 'border-gray-700 text-gray-400'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Options Pro — visibles uniquement si famille active */}
          {subtitleFamily && (
            <>
              <div>
                <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">Position</p>
                <SubtitlePositionPicker value={subtitlePosition} onChange={setSubtitlePosition} />
              </div>

              <div>
                <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">Animation</p>
                <div className="flex flex-wrap gap-1">
                  {ANIMATIONS.map(a => (
                    <button
                      key={a.id}
                      onClick={() => setSubtitleAnimation(a.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                        subtitleAnimation === a.id
                          ? 'border-sage bg-sage/20 text-white'
                          : 'border-gray-700 text-gray-400'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Styles V1 — visibles uniquement si pas de famille Pro */}
          {!subtitleFamily && (
            <div>
              <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">Style V1</p>
              <div className="flex flex-wrap gap-1.5">
                {V1_STYLES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSubtitleStyle(s.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                      subtitleStyle === s.id ? 'border-sage bg-sage/20 text-white' : 'border-gray-700 text-gray-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Segments editables */}
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {subtitles.map(seg => (
              <div key={seg.id} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-12 shrink-0">
                  {seg.startTime.toFixed(1)}s
                </span>
                <input
                  value={seg.text}
                  onChange={e => updateSubtitle(seg.id, e.target.value)}
                  className="flex-1 bg-gray-800 text-white text-xs rounded px-2 py-1"
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
