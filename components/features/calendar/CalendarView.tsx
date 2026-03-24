'use client';

import { useState, useRef, useEffect } from 'react';
import { useCalendar } from '@/lib/hooks/useCalendar';
import { useCalendarSlots } from '@/lib/hooks/useCalendarSlots';
import { generateWeekSlots } from '@/lib/utils/calendarSlots';
import { useAuthStore } from '@/lib/store/useAuthStore';
import CalendarHeader from './CalendarHeader';
import DashboardBar from './DashboardBar';
import CalendarDay from './CalendarDay';
import ScheduleSheet from './ScheduleSheet';
import ItemDetailSheet from './ItemDetailSheet';
import FillSlotSheet from './FillSlotSheet';
import CreateSequenceSheet from './CreateSequenceSheet';
import type { ContentItem, CalendarSlot } from '@/lib/types';

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

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

  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);
  const [detailItem, setDetailItem] = useState<ContentItem | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [showSequence, setShowSequence] = useState(false);

  // Génère les slots pour chaque semaine du mois affiché (anti-doublons géré dans generateWeekSlots)
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

  const touchXRef = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchXRef.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchXRef.current;
    if (diff > 60) goToPreviousMonth();
    if (diff < -60) goToNextMonth();
  };

  const today = new Date();
  const curMonth = currentMonth.getMonth();
  const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

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
      <DashboardBar />
      <CalendarHeader currentMonth={currentMonth} onPrev={goToPreviousMonth} onNext={goToNextMonth} onOpenSequence={() => setShowSequence(true)} items={scheduledItems} slots={slots} />

      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
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
              items={itemsByDay.get(dayKey(date)) ?? []}
              slots={slotsByDay.get(dayKey(date)) ?? []}
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
