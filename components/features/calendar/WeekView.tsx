'use client';

import { useMemo } from 'react';
import { FireIcon } from '@heroicons/react/24/solid';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { useCalendarSlots } from '@/lib/hooks/useCalendarSlots';
import { useProgression } from '@/lib/hooks/useProgression';
import { getStyleColor, getStyleLabel, getStyleBg } from '@/lib/utils/contentStyles';
import ProgressionCircle from './ProgressionCircle';
import type { ContentItem, CalendarSlot } from '@/lib/types';

const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

interface Props {
  weekStart: Date;
  itemsByDay: Map<string, ContentItem[]>;
  onTapItem: (item: ContentItem) => void;
  onTapSlot: (slot: CalendarSlot) => void;
  onTapEmpty: (date: Date) => void;
}

function getWeekDays(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function isToday(d: Date): boolean {
  const t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
}

export default function WeekView({ weekStart, itemsByDay, onTapItem, onTapSlot, onTapEmpty }: Props) {
  const today = new Date();
  const { slots, slotsByDay } = useCalendarSlots(weekStart.getMonth(), weekStart.getFullYear());
  const { progressData } = useProgression();
  const streak = progressData?.currentStreak ?? 0;

  const days = useMemo(() => getWeekDays(weekStart), [weekStart]);

  // Slots de cette semaine seulement
  const weekSlots = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 7);
    return slots.filter((s) => {
      const d = s.scheduledDate.toDate();
      return d >= weekStart && d < end;
    });
  }, [slots, weekStart]);

  const filled = weekSlots.filter((s) => s.status === 'filled' || s.status === 'completed').length;
  const total = weekSlots.length;

  // Date range label
  const endDate = new Date(weekStart);
  endDate.setDate(weekStart.getDate() + 6);
  const rangeLabel = `${weekStart.getDate()} – ${endDate.getDate()} ${endDate.toLocaleString('fr-CA', { month: 'long' })}`;

  return (
    <div>
      {/* Progression header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <ProgressionCircle completed={filled} total={Math.max(total, 1)} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              {total === 0
                ? 'Aucune publication prévue'
                : `${total} publication${total > 1 ? 's' : ''} cette semaine`}
            </p>
            {total > 0 && filled === 0 && (
              <p className="text-xs text-gray-400 mt-0.5">Tap sur un jour pour commencer</p>
            )}
            {filled > 0 && filled < total && (
              <p className="text-xs text-gray-400 mt-0.5">{filled}/{total} complétés — continue!</p>
            )}
            {filled > 0 && filled === total && (
              <p className="text-xs text-green-600 mt-0.5 font-medium">Semaine complète!</p>
            )}
          </div>
          {streak > 0 && (
            <div className="shrink-0 text-right">
              <div className="flex items-center gap-1 bg-orange-50 rounded-full px-2.5 py-1 border border-orange-100">
                <FireIcon className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs font-semibold text-orange-600">{streak}</span>
              </div>
              <p className="text-[10px] text-orange-400 mt-0.5 leading-tight">
                {streak === 1 ? 'semaine active!' : `semaines — t'es en feu!`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Day rows */}
      <div className="px-3 py-2 flex flex-col gap-1.5">
        {days.map((date) => {
          const key = dayKey(date);
          const items = itemsByDay.get(key) ?? [];
          const daySlots = slotsByDay.get(key) ?? [];
          const activeSlots = daySlots.filter((s) => s.status !== 'skipped');
          const isTodayDate = isToday(date);

          return (
            <DayRow
              key={key}
              date={date}
              isToday={isTodayDate}
              items={items}
              slots={activeSlots}
              onTapItem={onTapItem}
              onTapSlot={onTapSlot}
              onTapEmpty={onTapEmpty}
            />
          );
        })}
      </div>
    </div>
  );
}

// --- DayRow ---

interface DayRowProps {
  date: Date;
  isToday: boolean;
  items: ContentItem[];
  slots: CalendarSlot[];
  onTapItem: (item: ContentItem) => void;
  onTapSlot: (slot: CalendarSlot) => void;
  onTapEmpty: (date: Date) => void;
}

function DayRow({ date, isToday, items, slots, onTapItem, onTapSlot, onTapEmpty }: DayRowProps) {
  const hasContent = items.length > 0 || slots.length > 0;
  const openSlot = slots.find((s) => s.status === 'open');

  // Slot ouvert — CTA coloré
  if (openSlot && items.length === 0) {
    const color = getStyleColor(openSlot.contentStyle);
    const label = getStyleLabel(openSlot.contentStyle);
    const bg = getStyleBg(openSlot.contentStyle);
    const formatLabel = openSlot.format === 'reel' ? 'Reel' : openSlot.format === 'story' ? 'Story' : 'Post';

    return (
      <button
        onClick={() => onTapSlot(openSlot)}
        className="flex items-center gap-3 p-3 rounded-xl transition-colors text-left"
        style={{ border: `1.5px dashed ${color}`, backgroundColor: `${color}10` }}
      >
        <DateBadge date={date} isToday={isToday} accentColor={color} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${bg}`}>{label}</span>
            <span className="text-[11px]" style={{ color }}>{formatLabel}</span>
          </div>
          <p className="text-xs" style={{ color }}>Choisir une idée ou créer</p>
        </div>
        <PlusCircleIcon className="w-6 h-6 shrink-0" style={{ color }} />
      </button>
    );
  }

  // Slot de séquence (filled ou auto-publish)
  if (slots.length > 0 && slots[0].sequenceRole) {
    const slot = slots[0];
    const color = getStyleColor(slot.contentStyle);
    const roleLabels: Record<string, string> = {
      story_promo: 'Story promo — Lien dans ma bio',
      reel_resume: 'Reel — Résumé de l\'article',
      reel_pratique: 'Reel — Conseil concret',
      story_rappel: 'Story rappel',
    };
    const roleLabel = roleLabels[slot.sequenceRole ?? ''] ?? slot.format;
    const pos = slot.sequencePosition;
    const len = slot.sequenceLength;

    return (
      <button
        onClick={() => slot.autoPublish ? undefined : onTapSlot(slot)}
        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white transition-colors text-left hover:bg-gray-50"
      >
        <DateBadge date={date} isToday={isToday} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">Séquence</span>
            <span className="text-[11px] text-gray-400">{roleLabel}</span>
          </div>
          {slot.promptTitle && (
            <p className="text-xs text-gray-500 truncate">{slot.promptTitle}</p>
          )}
          {slot.autoPublish && (
            <p className="text-[10px] text-gray-400 mt-0.5">Publication automatique</p>
          )}
        </div>
        {pos && len && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-600 shrink-0">
            {pos}/{len}
          </span>
        )}
      </button>
    );
  }

  // Content item existant
  if (items.length > 0) {
    const item = items[0];
    const color = item.contentStyle ? getStyleColor(item.contentStyle) : undefined;

    return (
      <button
        onClick={() => onTapItem(item)}
        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white transition-colors text-left hover:bg-gray-50"
      >
        <DateBadge date={date} isToday={isToday} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
          {item.contentStyle && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getStyleBg(item.contentStyle)}`}>
              {getStyleLabel(item.contentStyle)}
            </span>
          )}
        </div>
        {color && <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />}
      </button>
    );
  }

  // Jour vide — carte pâle
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/50 border border-gray-100/60">
      <DateBadge date={date} isToday={isToday} muted />
      <p className="text-[13px] text-gray-300">—</p>
    </div>
  );
}

// --- DateBadge ---

function DateBadge({ date, isToday, accentColor, muted }: {
  date: Date; isToday: boolean; accentColor?: string; muted?: boolean;
}) {
  const dayName = DAY_NAMES[date.getDay()];
  const textColor = accentColor
    ? accentColor
    : isToday
    ? '#5C7A5F'
    : muted
    ? '#9CA3AF'
    : '#4B5563';

  return (
    <div className="text-center" style={{ minWidth: 36 }}>
      <p className="text-[10px] uppercase font-medium leading-none" style={{ color: textColor }}>
        {dayName}
      </p>
      <p
        className={`text-base font-semibold leading-tight mt-0.5 ${
          isToday ? 'bg-sage text-white w-7 h-7 rounded-full flex items-center justify-center mx-auto' : ''
        }`}
        style={isToday ? undefined : { color: textColor }}
      >
        {date.getDate()}
      </p>
    </div>
  );
}
