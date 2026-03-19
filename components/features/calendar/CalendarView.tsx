'use client';

import { useState, useRef } from 'react';
import { useCalendar } from '@/lib/hooks/useCalendar';
import CalendarHeader from './CalendarHeader';
import DashboardBar from './DashboardBar';
import CalendarDay from './CalendarDay';
import ScheduleSheet from './ScheduleSheet';
import ItemDetailSheet from './ItemDetailSheet';
import type { ContentItem } from '@/lib/types';

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default function CalendarView() {
  const {
    currentMonth,
    calendarDays,
    itemsByDay,
    loading,
    error,
    goToNextMonth,
    goToPreviousMonth,
  } = useCalendar();

  const [scheduleDate, setScheduleDate] = useState<Date | null>(null);
  const [detailItem, setDetailItem] = useState<ContentItem | null>(null);

  // Swipe natif pour naviguer entre les mois
  const touchXRef = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchXRef.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchXRef.current;
    if (diff > 60) goToPreviousMonth();
    if (diff < -60) goToNextMonth();
  };

  const today = new Date();
  const curMonth = currentMonth.getMonth();

  const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  const handleDayTap = (date: Date, items: ContentItem[]) => {
    if (items.length > 0) {
      setDetailItem(items[0]);
    } else {
      setScheduleDate(date);
    }
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
      <CalendarHeader currentMonth={currentMonth} onPrev={goToPreviousMonth} onNext={goToNextMonth} />

      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {/* En-têtes jours de la semaine */}
        <div className="grid grid-cols-7 px-2">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="text-center text-xs text-gray-400 py-2 font-medium">
              {d}
            </div>
          ))}
        </div>

        {/* Grille 6×7 */}
        <div className="grid grid-cols-7 px-2">
          {calendarDays.map((date, i) => {
            const items = itemsByDay.get(dayKey(date)) ?? [];
            return (
              <CalendarDay
                key={i}
                date={date}
                items={items}
                isCurrentMonth={date.getMonth() === curMonth}
                isToday={
                  date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear()
                }
                onTap={handleDayTap}
              />
            );
          })}
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
    </>
  );
}
