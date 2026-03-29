'use client';

import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';

const TABS: { id: string; label: string; disabled?: boolean }[] = [
  { id: 'style', label: 'Style' },
  { id: 'trim', label: 'Trim' },
  { id: 'filtres', label: 'Filtres' },
  { id: 'texte', label: 'Texte' },
  { id: 'subs', label: 'Sous-titres' },
  { id: 'audio', label: 'Audio' },
  { id: 'cover', label: 'Cover' },
];

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export default function EditorToolbar({ activeTab, onTabChange, isPlaying, onTogglePlay }: Props) {
  return (
    <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-900 shrink-0">
      {/* Bouton play/pause dédié — hors du preview pour éviter les conflits de gestes */}
      <button
        onClick={onTogglePlay}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 text-white shrink-0 active:bg-gray-700"
        aria-label={isPlaying ? 'Pause' : 'Lecture'}
      >
        {isPlaying
          ? <PauseIcon className="w-4 h-4" />
          : <PlayIcon className="w-4 h-4 ml-0.5" />}
      </button>
      <div className="flex gap-1 overflow-x-auto scrollbar-hide flex-1">
        {TABS.map(({ id, label, disabled }) => (
          <button
            key={id}
            onClick={() => !disabled && onTabChange(id)}
            disabled={disabled}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === id
                ? 'bg-sage text-white'
                : disabled
                  ? 'text-gray-600'
                  : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
