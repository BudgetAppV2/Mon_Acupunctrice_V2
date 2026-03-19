'use client';

import { useRef, useEffect } from 'react';
import { useVideoExport, type ExportState } from '@/lib/hooks/useVideoExport';
import { ArrowUpTrayIcon, CheckCircleIcon, ExclamationCircleIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface Props {
  onExportDone?: () => void;
}

export default function ExportButton({ onExportDone }: Props) {
  const { exportVideo, state, progress, error, supportsWebCodecs } = useVideoExport();
  const busy = state === 'preparing' || state === 'exporting' || state === 'uploading';
  const doneCalled = useRef(false);

  // Notifier le parent quand l'export est termine
  useEffect(() => {
    if (state === 'done' && !doneCalled.current && onExportDone) {
      doneCalled.current = true;
      onExportDone();
    }
    if (state !== 'done') doneCalled.current = false;
  }, [state, onExportDone]);

  // Apres export : le bouton devient "Publier"
  if (state === 'done') {
    return (
      <button
        onClick={onExportDone}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sage text-white"
      >
        <PaperAirplaneIcon className="w-4 h-4" />
        Publier
      </button>
    );
  }

  return (
    <>
      <button
        onClick={exportVideo}
        disabled={busy}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
          state === 'error' ? 'bg-red-500 text-white' : busy ? 'bg-sage/60 text-white/80' : 'bg-sage text-white'
        }`}
      >
        {state === 'error' && <ExclamationCircleIcon className="w-4 h-4" />}
        {(state === 'idle' || busy) && <ArrowUpTrayIcon className="w-4 h-4" />}
        {state === 'idle' && 'Exporter'}
        {state === 'preparing' && 'Prep...'}
        {state === 'exporting' && `${progress}%`}
        {state === 'uploading' && 'Sauvegarde...'}
        {state === 'error' && 'Reessayer'}
      </button>

      {state === 'exporting' && (
        <div className="absolute top-11 left-0 right-0 h-0.5 bg-gray-800 z-20">
          <div className="h-full bg-sage transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      )}

      {busy && !supportsWebCodecs && (
        <div className="absolute top-12 left-0 right-0 flex justify-center z-20">
          <span className="text-[10px] text-gray-400 bg-gray-900/80 px-2 py-0.5 rounded-full">Export en cours (1-2 min)...</span>
        </div>
      )}
    </>
  );
}
