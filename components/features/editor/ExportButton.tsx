'use client';

import { useRef, useEffect, useState } from 'react';
import { useVideoExport, type ExportState } from '@/lib/hooks/useVideoExport';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { ArrowUpTrayIcon, ExclamationCircleIcon, PaperAirplaneIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface Props {
  onExportDone?: () => void;
  onSwitchTab?: (tab: string) => void;
}

function stateLabel(state: ExportState, progress: number): string {
  switch (state) {
    case 'preparing': return 'Preparation...';
    case 'exporting': return `Encodage ${progress}%`;
    case 'uploading': return `Sauvegarde ${progress}%`;
    case 'error': return 'Reessayer';
    default: return 'Exporter';
  }
}

export default function ExportButton({ onExportDone, onSwitchTab }: Props) {
  const { exportVideo, state, progress, error } = useVideoExport();
  const duration = useEditorStore((s) => s.duration);
  const hasCover = useEditorStore((s) => !!s.coverDataUrl || !!s.coverCustomUrl);
  const busy = state === 'preparing' || state === 'exporting' || state === 'uploading';
  const doneCalled = useRef(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showNoCover, setShowNoCover] = useState(false);

  useEffect(() => {
    if (state === 'done' && !doneCalled.current && onExportDone) { doneCalled.current = true; onExportDone(); }
    if (state !== 'done') doneCalled.current = false;
  }, [state, onExportDone]);

  const handleExport = () => {
    // Warning si pas de cover selectionnee
    if (!hasCover && !showNoCover && !showWarning) { setShowNoCover(true); return; }
    // Warning si video longue
    if (duration > 60 && !showWarning) { setShowNoCover(false); setShowWarning(true); return; }
    setShowWarning(false); setShowNoCover(false);
    exportVideo();
  };

  if (state === 'done') {
    return (
      <button onClick={onExportDone} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sage text-white">
        <PaperAirplaneIcon className="w-4 h-4" /> Publier
      </button>
    );
  }

  return (
    <>
      <button onClick={handleExport} disabled={busy}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
          state === 'error' ? 'bg-red-500 text-white' : busy ? 'bg-sage/60 text-white/80' : 'bg-sage text-white'
        }`}>
        {state === 'error' ? <ExclamationCircleIcon className="w-4 h-4" /> : <ArrowUpTrayIcon className="w-4 h-4" />}
        {stateLabel(state, progress)}
      </button>

      {(state === 'exporting' || state === 'uploading') && (
        <div className="absolute top-11 left-0 right-0 h-0.5 bg-gray-800 z-20">
          <div className="h-full bg-sage transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      )}

      {error && (
        <div className="absolute top-12 left-0 right-0 flex justify-center z-20">
          <span className="text-[10px] text-red-400 bg-gray-900/90 px-2 py-0.5 rounded-full max-w-[250px] text-center">{error}</span>
        </div>
      )}

      {/* Warning: pas de cover selectionnee */}
      {showNoCover && (
        <div className="absolute top-12 left-0 right-0 flex justify-center z-20">
          <div className="bg-gray-900/95 border border-gray-600 rounded-xl px-4 py-3 mx-4 max-w-[300px] text-center">
            <p className="text-xs text-gray-300 mb-2">Pas de cover — la premiere frame sera utilisee</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => { setShowNoCover(false); onSwitchTab?.('cover'); }} className="text-[10px] text-sage px-3 py-1 rounded-lg border border-sage/40 flex items-center gap-1">
                <PhotoIcon className="w-3 h-3" /> Choisir
              </button>
              <button onClick={handleExport} className="text-[10px] text-white px-3 py-1 rounded-lg bg-sage">Continuer</button>
            </div>
          </div>
        </div>
      )}

      {/* Warning: video longue */}
      {showWarning && (
        <div className="absolute top-12 left-0 right-0 flex justify-center z-20">
          <div className="bg-gray-900/95 border border-amber-500/50 rounded-xl px-4 py-3 mx-4 max-w-[300px] text-center">
            <p className="text-xs text-amber-300 mb-2">Cette video fait {Math.round(duration)}s. L'export peut prendre 1-2 minutes.</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setShowWarning(false)} className="text-[10px] text-gray-400 px-3 py-1 rounded-lg border border-gray-600">Annuler</button>
              <button onClick={handleExport} className="text-[10px] text-white px-3 py-1 rounded-lg bg-sage">Continuer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
