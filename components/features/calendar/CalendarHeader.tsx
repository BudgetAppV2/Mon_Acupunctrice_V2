'use client';

import { ChevronLeftIcon, ChevronRightIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import MonthSummary from './MonthSummary';
import type { ContentItem, CalendarSlot } from '@/lib/types';

const MONTHS = [
  'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre',
];

interface Props {
  currentMonth: Date;
  onPrev: () => void;
  onNext: () => void;
  onOpenSequence: () => void;
  items: ContentItem[];
  slots: CalendarSlot[];
}

export default function CalendarHeader({ currentMonth, onPrev, onNext, onOpenSequence, items, slots }: Props) {
  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between mb-1">
        <button onClick={onPrev} className="p-2 text-gray-500 hover:text-gray-700" aria-label="Mois precedent">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <h2 className="text-base font-semibold text-gray-900">
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <div className="flex items-center gap-1">
          <button onClick={onOpenSequence} className="p-2 text-gray-500 hover:text-sage transition-colors" aria-label="Nouvelle sequence blogue">
            <BookOpenIcon className="w-5 h-5" />
          </button>
          <button onClick={onNext} className="p-2 text-gray-500 hover:text-gray-700" aria-label="Mois suivant">
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <MonthSummary items={items} slots={slots} />
    </div>
  );
}
