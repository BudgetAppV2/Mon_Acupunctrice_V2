'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

interface Props {
  currentMonth: Date;
  onPrev: () => void;
  onNext: () => void;
}

export default function CalendarHeader({ currentMonth, onPrev, onNext }: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <button onClick={onPrev} className="p-2 text-gray-500 hover:text-gray-700" aria-label="Mois précédent">
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
      <h2 className="text-base font-semibold text-gray-900">
        {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
      </h2>
      <button onClick={onNext} className="p-2 text-gray-500 hover:text-gray-700" aria-label="Mois suivant">
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
