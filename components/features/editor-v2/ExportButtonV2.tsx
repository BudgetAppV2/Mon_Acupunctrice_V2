'use client';

import { useRef, useEffect, useState } from 'react';
import { useVideoExportV2, type ExportV2State } from '@/lib/hooks/useVideoExportV2';
import { useEditorV2Store } from '@/lib/store/useEditorV2Store';
import { ArrowUpTrayIcon, ExclamationCircleIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface Props {
  onExportDone?: () => void;
}

function stateLabel(state: ExportV2State, progress: number): string {
  switch (state) {
    case 'preparing': return 'Preparation...';
    case 'exporting': return `Encodage ${progress}%`;
    case 'uploading': return `Sauvegarde ${progress}%`;
    case 'error': return 'Reessayer';
    default: return 'Exporter';
  }
}

export default function ExportButtonV2({ onExportDone }: Props) {
  const { exportVideo, state, progress, error, supportsWebCodecs } = useVideoExportV2();
  const duration = useEditorV2Store((s) => s.duration);
  const busy = state === 'preparing' || state === 'exporting' || state === 'uploading';
  const doneCalled = useRef(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (state === 'done' && !doneCalled.current && onExportDone) { doneCalled.current = true; onExportDone(); }
    if (state !== 'done') doneCalled.current = false;
  }, [state, onExportDone]);

  if (!supportsWebCodecs) return null;

  const handleExport = () => {
    if (duration > 60000 && !showWarning) { setShowWarning(true); return; }
    setShowWarning(false);
    exportVideo();
  };

  if (state === 'done') {
    return (
      <button onClick={onExportDone} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 text-white">
        <PaperAirplaneIcon className="w-4 h-4" /> Publier
      </button>
    );
  }

  return (
    <div className="relative">
      <button onClick={handleExport} disabled={busy}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
          state === 'error' ? 'bg-red-500 text-white' : busy ? 'bg-emerald-500/60 text-white/80' : 'bg-emerald-500 text-white'
        }`}>
        {state === 'error' ? <ExclamationCircleIcon className="w-4 h-4" /> : <ArrowUpTrayIcon className="w-4 h-4" />}
        {stateLabel(state, progress)}
      </button>

      {(state === 'exporting' || state === 'uploading') && (
        <div className="absolute top-full left-0 right-0 mt-0.5 h-0.5 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      )}

      {error && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-20">
          <span className="text-[10px] text-red-400 bg-gray-900/90 px-2 py-0.5 rounded-full whitespace-nowrap">{error}</span>
        </div>
      )}

      {showWarning && (
        <div className="absolute top-full right-0 mt-1 z-20">
          <div className="bg-gray-900/95 border border-amber-500/50 rounded-xl px-4 py-3 max-w-[250px] text-center">
            <p className="text-xs text-amber-300 mb-2">Video de {Math.round(duration / 1000)}s. L'export peut prendre 1-2 minutes.</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setShowWarning(false)} className="text-[10px] text-gray-400 px-3 py-1 rounded-lg border border-gray-600">Annuler</button>
              <button onClick={handleExport} className="text-[10px] text-white px-3 py-1 rounded-lg bg-emerald-500">Continuer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
