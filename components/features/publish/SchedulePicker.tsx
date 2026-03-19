'use client';

import { useState } from 'react';
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Props {
  onSchedule: (date: Date) => void;
  onCancel: () => void;
}

/** Selecteur date/heure pour planifier une publication */
export default function SchedulePicker({ onSchedule, onCancel }: Props) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('18:00');

  const handleConfirm = () => {
    if (!date) return;
    const d = new Date(`${date}T${time}`);
    if (d > new Date()) onSchedule(d);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Planifier la publication</h3>
        <button onClick={onCancel}><XMarkIcon className="w-4 h-4 text-gray-400" /></button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Date</label>
          <input
            type="date" value={date} onChange={e => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Heure</label>
          <input
            type="time" value={time} onChange={e => setTime(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
      </div>
      <button
        onClick={handleConfirm} disabled={!date}
        className="w-full py-3 bg-sage text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <CalendarIcon className="w-5 h-5" /> Planifier
      </button>
    </div>
  );
}
