'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import { useCalendar } from '@/lib/hooks/useCalendar';
import { useCalendarSlots } from '@/lib/hooks/useCalendarSlots';
import { generateWeekSlots } from '@/lib/utils/calendarSlots';
import { useAuthStore } from '@/lib/store/useAuthStore';
import CalendarHeader from './CalendarHeader';
import CalendarDay from './CalendarDay';
import WeekView from './WeekView';
import ScheduleSheet from './ScheduleSheet';
import ItemDetailSheet from './ItemDetailSheet';
import FillSlotSheet from './FillSlotSheet';
import CreateSequenceSheet from './CreateSequenceSheet';
import type { ContentItem, CalendarSlot } from '@/lib/types';

type ViewMode = 'week' | 'month';

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay() || 7; // 1=lundi...7=dimanche
  d.setDate(d.getDate() - (day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function CalendarView() {
  const uid = useAuthStore((s) => s.user?.uid);
  const {
    currentMonth,
    calendarDays,
    itemsByDay,
    scheduledItems,
    loading,
    error,
    goToNextMonth,
    goToPreviousMonth,
  } = useCalendar();

  const { slots, slotsByDay } = useCalendarSlots(currentMonth.getMonth(), currentMonth.getFullYear());

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);
  const [detailItem, setDetailItem] = useState<ContentItem | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [showSequence, setShowSequence] = useState(false);

  // Génère les slots pour chaque semaine du mois affiché
  useEffect(() => {
    if (!uid) return;
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    const last = new Date(y, m + 1, 0);
    const seen = new Set<string>();

    for (let d = new Date(y, m, 1); d <= last; d.setDate(d.getDate() + 1)) {
      const dow = d.getDay() || 7;
      const mon = new Date(d);
      mon.setDate(d.getDate() - (dow - 1));
      mon.setHours(0, 0, 0, 0);
      const key = mon.toISOString().slice(0, 10);
      if (!seen.has(key)) {
        seen.add(key);
        generateWeekSlots(uid, mon);
      }
    }
  }, [uid, currentMonth]);

  // Aussi générer pour la semaine affichée en vue semaine
  useEffect(() => {
    if (!uid) return;
    generateWeekSlots(uid, currentWeekStart);
  }, [uid, currentWeekStart]);

  // Navigation semaine
  const goToPreviousWeek = () => {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(prev.getDate() - 7);
      return d;
    });
  };
  const goToNextWeek = () => {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(prev.getDate() + 7);
      return d;
    });
  };

  // Date range label pour la vue semaine
  const weekEndDate = useMemo(() => {
    const d = new Date(currentWeekStart);
    d.setDate(currentWeekStart.getDate() + 6);
    return d;
  }, [currentWeekStart]);

  const weekRangeLabel = useMemo(() => {
    const s = currentWeekStart;
    const e = weekEndDate;
    if (s.getMonth() === e.getMonth()) {
      return `${s.getDate()} – ${e.getDate()} ${e.toLocaleString('fr-CA', { month: 'long' })}`;
    }
    return `${s.getDate()} ${s.toLocaleString('fr-CA', { month: 'short' })} – ${e.getDate()} ${e.toLocaleString('fr-CA', { month: 'short' })}`;
  }, [currentWeekStart, weekEndDate]);

  const touchXRef = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchXRef.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchXRef.current;
    if (viewMode === 'month') {
      if (diff > 60) goToPreviousMonth();
      if (diff < -60) goToNextMonth();
    } else {
      if (diff > 60) goToPreviousWeek();
      if (diff < -60) goToNextWeek();
    }
  };

  const today = new Date();
  const curMonth = currentMonth.getMonth();
  const dayKeyFn = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  const handleDayTap = (date: Date, items: ContentItem[]) => {
    if (items.length > 0) setDetailItem(items[0]);
    else setScheduleDate(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Top bar: toggle + navigation */}
      <div className="px-4 pt-2 pb-1 flex items-center justify-between">
        {/* Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'week'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            Semaine
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'month'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            Mois
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          {viewMode === 'week' ? (
            <>
              <button onClick={goToPreviousWeek} className="p-1.5 text-gray-400 hover:text-gray-600">
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">{weekRangeLabel}</span>
              <button onClick={goToNextWeek} className="p-1.5 text-gray-400 hover:text-gray-600">
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button onClick={goToPreviousMonth} className="p-1.5 text-gray-400 hover:text-gray-600">
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
                {currentMonth.toLocaleString('fr-CA', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={goToNextMonth} className="p-1.5 text-gray-400 hover:text-gray-600">
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </>
          )}
          <button onClick={() => setShowSequence(true)} className="p-1.5 text-gray-400 hover:text-sage ml-1" aria-label="Nouvelle séquence">
            <BookOpenIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {viewMode === 'week' ? (
          <WeekView
            weekStart={currentWeekStart}
            itemsByDay={itemsByDay}
            onTapItem={(item) => setDetailItem(item)}
            onTapSlot={(slot) => setSelectedSlot(slot)}
            onTapEmpty={(date) => setScheduleDate(date)}
          />
        ) : (
          <>
            <CalendarHeader
              currentMonth={currentMonth}
              onPrev={goToPreviousMonth}
              onNext={goToNextMonth}
              onOpenSequence={() => setShowSequence(true)}
              items={scheduledItems}
              slots={slots}
            />
            <div className="grid grid-cols-7 px-2">
              {WEEKDAYS.map((d, i) => (
                <div key={i} className="text-center text-xs text-gray-400 py-2 font-medium">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 px-2">
              {calendarDays.map((date, i) => (
                <CalendarDay
                  key={i}
                  date={date}
                  items={itemsByDay.get(dayKeyFn(date)) ?? []}
                  slots={slotsByDay.get(dayKeyFn(date)) ?? []}
                  isCurrentMonth={date.getMonth() === curMonth}
                  isToday={
                    date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear()
                  }
                  onTap={handleDayTap}
                  onTapSlot={setSelectedSlot}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <ScheduleSheet
        isOpen={!!scheduleDate}
        onClose={() => setScheduleDate(null)}
        selectedDate={scheduleDate}
        onScheduled={() => setScheduleDate(null)}
      />
      <ItemDetailSheet
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
        item={detailItem}
        onUnscheduled={() => setDetailItem(null)}
      />
      <FillSlotSheet
        isOpen={!!selectedSlot}
        onClose={() => setSelectedSlot(null)}
        slot={selectedSlot}
        onFilled={() => setSelectedSlot(null)}
      />
      <CreateSequenceSheet
        isOpen={showSequence}
        onClose={() => setShowSequence(false)}
      />
    </>
  );
}
