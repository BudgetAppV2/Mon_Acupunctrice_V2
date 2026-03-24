'use client';

import { useRef, useMemo } from 'react';
import { useCalendar } from '@/lib/hooks/useCalendar';
import { useCalendarSheets } from '@/lib/hooks/useCalendarSheets';
import CalendarHeader from './CalendarHeader';
import DashboardBar from './DashboardBar';
import CalendarDay from './CalendarDay';
import ScheduleSheet from './ScheduleSheet';
import ItemDetailSheet from './ItemDetailSheet';
import type { ContentItem, CalendarSlot } from '@/lib/types';

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
// Pas de slots Firestore avant S02 — tableau vide stable
const EMPTY_SLOTS: CalendarSlot[] = [];

export default function CalendarView() {
  const { currentMonth, calendarDays, itemsByDay, scheduledItems, loading, error, goToNextMonth, goToPreviousMonth } = useCalendar();
  const sheets = useCalendarSheets();

  // Swipe natif pour naviguer entre les mois
  const touchXRef = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchXRef.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchXRef.current;
    if (diff > 60) goToPreviousMonth();
    if (diff < -60) goToNextMonth();
  };

  const handleDayTap = (date: Date, items: ContentItem[]) => {
    if (items.length > 0) sheets.onTapItem(items[0]);
    else sheets.onTapEmptyDay(date);
  };

  // Items du mois pour MonthSummary (via CalendarHeader)
  const monthItems = useMemo(() => scheduledItems ?? [], [scheduledItems]);

  const today = new Date();
  const curMonth = currentMonth.getMonth();
  const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

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
      <CalendarHeader
        currentMonth={currentMonth}
        onPrev={goToPreviousMonth}
        onNext={goToNextMonth}
        items={monthItems}
        slots={EMPTY_SLOTS}
      />

      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="grid grid-cols-7 px-2">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="text-center text-xs text-gray-400 py-2 font-medium">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 px-2">
          {calendarDays.map((date, i) => {
            const items = itemsByDay.get(dayKey(date)) ?? [];
            return (
              <CalendarDay
                key={i}
                date={date}
                items={items}
                slots={EMPTY_SLOTS}
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
        isOpen={sheets.showSchedule}
        onClose={sheets.closeAll}
        selectedDate={sheets.selectedDate}
        onScheduled={sheets.closeAll}
      />
      <ItemDetailSheet
        isOpen={!!sheets.selectedItem}
        onClose={sheets.closeAll}
        item={sheets.selectedItem}
        onUnscheduled={sheets.closeAll}
      />
    </>
  );
}
