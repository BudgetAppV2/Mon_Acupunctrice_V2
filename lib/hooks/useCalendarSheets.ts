'use client';

import { useState } from 'react';
import type { ContentItem, CalendarSlot } from '@/lib/types';

export function useCalendarSheets() {
  const [selectedItem, setSelectedItem]   = useState<ContentItem | null>(null);
  const [selectedSlot, setSelectedSlot]   = useState<CalendarSlot | null>(null);
  const [selectedDate, setSelectedDate]   = useState<Date | null>(null);
  const [showSchedule, setShowSchedule]   = useState(false);
  const [showSequence, setShowSequence]   = useState(false);

  return {
    selectedItem,
    selectedSlot,
    selectedDate,
    showSchedule,
    showSequence,
    onTapItem: (item: ContentItem) => setSelectedItem(item),
    onTapSlot: (slot: CalendarSlot) => setSelectedSlot(slot),
    onTapEmptyDay: (date: Date) => { setSelectedDate(date); setShowSchedule(true); },
    closeAll: () => {
      setSelectedItem(null);
      setSelectedSlot(null);
      setShowSchedule(false);
      setShowSequence(false);
    },
    openSequenceSheet: () => setShowSequence(true),
  };
}
