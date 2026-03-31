'use client';

import { useSubtitleStore, getVideoTrack } from '../lib/store';
import { useTranscription } from '../lib/useTranscription';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function TranscribeButton() {
  const { tracks, setSubtitleBlocks } = useSubtitleStore();
  const { transcribe, loading, stage, error } = useTranscription();

  const vt = getVideoTrack(tracks);
  const firstClip = vt?.clips?.[0] ?? null;
  const hasVideo = !!firstClip?.file;

  const stageLabel: Record<string, string> = {
    extracting: 'Extraction audio...',
    transcribing: 'Transcription...',
  };

  const handleTranscribe = async () => {
    if (!firstClip?.file) return;
    const blocks = await transcribe(firstClip.file);
    if (blocks.length > 0) {
      setSubtitleBlocks(blocks);
    }
  };

  return (
    <div className="px-3 py-2 border-b border-white/10">
      <button onClick={handleTranscribe} disabled={!hasVideo || loading}
        className={`w-full py-2 rounded-lg text-[11px] font-medium flex items-center justify-center gap-2 transition-colors
          ${hasVideo && !loading
            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 active:bg-emerald-500/25'
            : 'bg-white/5 border border-white/10 text-white/25'}`}>
        <SparklesIcon className="w-4 h-4" />
        {loading ? (stageLabel[stage] ?? 'Transcription...') : 'Transcrire'}
      </button>
      {error && <p className="text-[10px] text-red-400/80 mt-1">{error}</p>}
    </div>
  );
}
