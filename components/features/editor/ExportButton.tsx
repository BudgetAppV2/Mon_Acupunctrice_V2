'use client';

import { useVideoExport, type ExportState } from '@/lib/hooks/useVideoExport';
import { ArrowUpIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

const LABELS: Record<ExportState, string> = {
  idle: 'Exporter la vidéo',
  preparing: 'Préparation...',
  exporting: 'Export en cours...',
  uploading: 'Sauvegarde...',
  done: 'Vidéo prête !',
  error: 'Réessayer',
};

export default function ExportButton() {
  const { exportVideo, state, progress, error, supportsWebCodecs } = useVideoExport();
  const busy = state === 'preparing' || state === 'exporting' || state === 'uploading';

  return (
    <div className="px-4 py-1.5 bg-gray-900 shrink-0" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 6px)' }}>
      <button
        onClick={exportVideo}
        disabled={busy || state === 'done'}
        className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
          state === 'done'
            ? 'bg-green-600 text-white'
            : state === 'error'
              ? 'bg-red-500 text-white'
              : busy
                ? 'bg-sage/60 text-white/80'
                : 'bg-sage text-white'
        }`}
      >
        {state === 'done' && <CheckCircleIcon className="w-5 h-5" />}
        {state === 'error' && <ExclamationCircleIcon className="w-5 h-5" />}
        {state === 'idle' && <ArrowUpIcon className="w-5 h-5" />}
        {LABELS[state]}
        {state === 'exporting' && ` ${progress}%`}
      </button>

      {/* Barre de progression */}
      {state === 'exporting' && (
        <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-sage transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Message contextuel selon le moteur utilisé */}
      {busy && (
        <p className="text-xs text-gray-500 text-center mt-1">
          {supportsWebCodecs ? 'Export rapide en cours...' : 'Export en cours (peut prendre 1-2 min)...'}
        </p>
      )}

      {error && <p className="text-xs text-red-400 text-center mt-1">{error}</p>}
    </div>
  );
}
