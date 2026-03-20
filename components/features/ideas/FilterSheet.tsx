'use client';

import BottomSheet from '@/components/ui/BottomSheet';
import { CheckIcon } from '@heroicons/react/24/solid';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: { value: string; label: string }[];
  selected: string | undefined;
  onSelect: (value?: string) => void;
}

/** Bottom sheet radio-style pour un filtre unique (statut ou categorie) */
export default function FilterSheet({ isOpen, onClose, title, options, selected, onSelect }: Props) {
  const handleSelect = (value?: string) => {
    onSelect(value);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-0.5">
        <button onClick={() => handleSelect(undefined)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50">
          <span className={`text-sm ${!selected ? 'font-semibold text-sage' : 'text-gray-700'}`}>Tous / Toutes</span>
          {!selected && <CheckIcon className="w-4 h-4 text-sage" />}
        </button>
        {options.map(opt => (
          <button key={opt.value} onClick={() => handleSelect(opt.value)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50">
            <span className={`text-sm ${selected === opt.value ? 'font-semibold text-sage' : 'text-gray-700'}`}>{opt.label}</span>
            {selected === opt.value && <CheckIcon className="w-4 h-4 text-sage" />}
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
