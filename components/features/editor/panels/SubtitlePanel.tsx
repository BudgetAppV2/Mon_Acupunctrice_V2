'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';
import { useTranscription } from '@/lib/hooks/useTranscription';
import type { SubtitleStyle } from '@/lib/types';
import { SparklesIcon } from '@heroicons/react/24/outline';

const STYLES: { id: SubtitleStyle; label: string }[] = [
  { id: 'classic', label: 'Classique' },
  { id: 'bold_outline', label: 'Bold' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'pill', label: 'Pill' },
  { id: 'karaoke', label: 'Karaoke' },
  { id: 'karaoke_pro', label: 'Karaoke Pro' },
];

export default function SubtitlePanel() {
  const { subtitles, subtitleStyle, setSubtitles, setSubtitleStyle, updateSubtitle, videoFile } = useEditorStore();
  const { transcribe, loading, stage, error } = useTranscription();

  const handleGenerate = async () => {
    if (!videoFile) return;
    const segs = await transcribe(videoFile);
    if (segs.length > 0) setSubtitles(segs);
  };

  return (
    <div className="px-3 py-2 space-y-2">
      {/* Bouton auto-générer */}
      <button
        onClick={handleGenerate}
        disabled={loading || !videoFile}
        className="w-full flex items-center justify-center gap-2 py-2 bg-sage text-white rounded-lg text-sm font-medium disabled:opacity-50"
      >
        <SparklesIcon className="w-4 h-4" />
        {stage === 'extracting' ? 'Extraction audio...' : stage === 'uploading' ? 'Envoi...' : stage === 'transcribing' ? 'Transcription...' : 'Auto-generer'}
      </button>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Sélecteur de style */}
      {subtitles.length > 0 && (
        <div className="flex gap-1.5">
          {STYLES.map(s => (
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
      )}

      {/* Segments éditables */}
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
    </div>
  );
}
