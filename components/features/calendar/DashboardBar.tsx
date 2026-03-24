'use client';

import { useMemo } from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { useCalendarSlots } from '@/lib/hooks/useCalendarSlots';
import { getStyleDot, getStyleDashedBorder } from '@/lib/utils/contentStyles';
import type { CalendarSlot } from '@/lib/types';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay() || 7; // 1=lundi, 7=dimanche
  d.setDate(d.getDate() - (day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export default function DashboardBar() {
  const today = new Date();
  const { slots } = useCalendarSlots(today.getMonth(), today.getFullYear());

  // Slots de la semaine courante uniquement
  const weekSlots = useMemo(() => {
    const monday = getWeekStart(today);
    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);
    return slots.filter((s) => {
      const d = s.scheduledDate.toDate();
      return d >= monday && d < nextMonday;
    });
    // today est stable au sein d'un rendu
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots]);

  const weekNum = weekSlots[0]?.weekNumber ?? isoWeekNumber(today);
  const monday = getWeekStart(today);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const dateRange = `${monday.getDate()} – ${sunday.getDate()} ${sunday.toLocaleString('fr-CA', { month: 'long' })}`;
  const filled = weekSlots.filter((s) => s.status === 'filled' || s.status === 'completed').length;

  return (
    <div className="px-4 py-3 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-gray-900">Semaine {weekNum}</span>
          <span className="text-xs text-gray-400">{dateRange}</span>
        </div>
        <span className="text-sm font-semibold text-sage">{filled}/{weekSlots.length}</span>
      </div>
      <div className="flex gap-2">
        {weekSlots.map((slot) => <SlotCircle key={slot.id} slot={slot} />)}
        {weekSlots.length === 0 && (
          <span className="text-xs text-gray-400">Aucun emplacement cette semaine</span>
        )}
      </div>
    </div>
  );
}

function SlotCircle({ slot }: { slot: CalendarSlot }) {
  if (slot.status === 'completed') {
    return (
      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center" title="Complete">
        <CheckIcon className="w-3 h-3 text-white" />
      </div>
    );
  }
  if (slot.status === 'filled') {
    return <div className={`w-5 h-5 rounded-full ${getStyleDot(slot.contentStyle)}`} title="Rempli" />;
  }
  if (slot.status === 'skipped') {
    return <div className="w-5 h-5 rounded-full border-2 border-gray-200 bg-gray-50" title="Passe" />;
  }
  // open
  return (
    <div
      className={`w-5 h-5 rounded-full border-2 border-dashed ${getStyleDashedBorder(slot.contentStyle)}`}
      title="Ouvert"
    />
  );
}
