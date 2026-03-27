'use client';

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
}

export default function EditorToolbar({ activeTab, onTabChange }: Props) {
  return (
    <div className="flex gap-1 px-2 py-1.5 bg-gray-900 overflow-x-auto scrollbar-hide shrink-0">
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
  );
}
