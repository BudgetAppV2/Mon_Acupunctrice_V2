'use client';

import { useVideoExport, type ExportState } from '@/lib/hooks/useVideoExport';
import { ArrowUpTrayIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function ExportButton() {
  const { exportVideo, state, progress, error, supportsWebCodecs } = useVideoExport();
  const busy = state === 'preparing' || state === 'exporting' || state === 'uploading';

  return (
    <>
      {/* Bouton compact — intégré dans le header via slot */}
      <button
        onClick={exportVideo}
        disabled={busy || state === 'done'}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
          state === 'done'
            ? 'bg-green-600 text-white'
            : state === 'error'
              ? 'bg-red-500 text-white'
              : busy
                ? 'bg-sage/60 text-white/80'
                : 'bg-sage text-white'
        }`}
      >
        {state === 'done' && <CheckCircleIcon className="w-4 h-4" />}
        {state === 'error' && <ExclamationCircleIcon className="w-4 h-4" />}
        {(state === 'idle' || busy) && <ArrowUpTrayIcon className="w-4 h-4" />}
        {state === 'idle' && 'Exporter'}
        {state === 'preparing' && 'Prép...'}
        {state === 'exporting' && `${progress}%`}
        {state === 'uploading' && 'Sauvegarde...'}
        {state === 'done' && 'Prête!'}
        {state === 'error' && 'Réessayer'}
      </button>

      {/* Barre de progression — overlay sous le header */}
      {state === 'exporting' && (
        <div className="absolute top-11 left-0 right-0 h-0.5 bg-gray-800 z-20">
          <div
            className="h-full bg-sage transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Message si lent */}
      {busy && !supportsWebCodecs && (
        <div className="absolute top-12 left-0 right-0 flex justify-center z-20">
          <span className="text-[10px] text-gray-400 bg-gray-900/80 px-2 py-0.5 rounded-full">
            Export en cours (1-2 min)...
          </span>
        </div>
      )}
    </>
  );
}
