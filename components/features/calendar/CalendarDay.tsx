'use client';

import React, { memo } from 'react';
import DayIndicators from './DayIndicators';
import type { ContentItem, CalendarSlot } from '@/lib/types';

interface Props {
  date: Date;
  items: ContentItem[];
  slots: CalendarSlot[];
  isCurrentMonth: boolean;
  isToday: boolean;
  onTap: (date: Date, items: ContentItem[]) => void;
  onTapSlot: (slot: CalendarSlot) => void;
}

function CalendarDay({ date, items, slots, isCurrentMonth, isToday, onTap, onTapSlot }: Props) {
  if (!isCurrentMonth) {
    return (
      <div className="flex flex-col items-center py-1 min-h-[52px]">
        <span className="text-xs font-medium w-6 h-6 flex items-center justify-center text-gray-300">
          {date.getDate()}
        </span>
      </div>
    );
  }

  const openSlots = slots.filter((s) => s.status === 'open');

  const handleClick = () => {
    if (items.length > 0) onTap(date, items);
    else if (openSlots.length > 0) onTapSlot(openSlots[0]);
    else onTap(date, []);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex flex-col items-center py-1 min-h-[52px] rounded-lg transition-colors ${
        isToday ? 'bg-sage/10' : 'hover:bg-gray-50'
      }`}
    >
      <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
        isToday ? 'bg-sage text-white' : 'text-gray-900'
      }`}>
        {date.getDate()}
      </span>
      <DayIndicators items={items} slots={slots} />
    </button>
  );
}

export default memo(CalendarDay);
