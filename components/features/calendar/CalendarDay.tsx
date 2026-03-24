'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import type { ContentItem, CalendarSlot, WorkflowState } from '@/lib/types';
import { getStyleDot, getStyleDashedBorder } from '@/lib/utils/contentStyles';

const DOT_COLORS: Record<WorkflowState, string> = {
  idea: 'bg-status-idea',
  planned: 'bg-status-planned',
  ready_to_shoot: 'bg-status-shot',
  shot: 'bg-status-shot',
  editing: 'bg-status-editing',
  ready: 'bg-status-ready',
};

interface Props {
  date: Date;
  items: ContentItem[];
  slots: CalendarSlot[];
  isCurrentMonth: boolean;
  isToday: boolean;
  onTap: (date: Date, items: ContentItem[]) => void;
  onTapSlot: (slot: CalendarSlot) => void;
}

export default function CalendarDay({ date, items, slots, isCurrentMonth, isToday, onTap, onTapSlot }: Props) {
  if (!isCurrentMonth) {
    return (
      <div className="flex flex-col items-center py-1 min-h-[48px]">
        <span className="text-xs font-medium w-6 h-6 flex items-center justify-center text-gray-300">
          {date.getDate()}
        </span>
      </div>
    );
  }

  const openSlots = slots.filter((s) => s.status === 'open');
  const completedSlots = slots.filter((s) => s.status === 'completed');
  const thumbnail = items.find((i) => i.thumbnailUrl)?.thumbnailUrl;

  const handleClick = () => {
    if (items.length > 0) {
      onTap(date, items);
    } else if (openSlots.length > 0) {
      onTapSlot(openSlots[0]);
    } else {
      onTap(date, []);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex flex-col items-center py-1 min-h-[48px] rounded-lg transition-colors ${
        isToday ? 'bg-sage/10' : 'hover:bg-gray-50'
      }`}
    >
      <span
        className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
          isToday ? 'bg-sage text-white' : 'text-gray-900'
        }`}
      >
        {date.getDate()}
      </span>

      {items.length > 0 && !thumbnail && (
        items.length > 1 ? (
          <span className="text-[9px] font-bold text-sage bg-sage/10 w-4 h-4 flex items-center justify-center rounded-full mt-0.5">
            {items.length}
          </span>
        ) : (
          <div className={`w-1.5 h-1.5 rounded-full mt-1 ${
            items[0].contentStyle
              ? getStyleDot(items[0].contentStyle)
              : (DOT_COLORS[items[0].workflowState] ?? 'bg-gray-400')
          }`} />
        )
      )}

      {thumbnail && (
        <img src={thumbnail} alt="" className="w-8 h-8 mt-0.5 rounded object-cover" />
      )}

      {/* Slots ouverts : fantôme pointillé */}
      {items.length === 0 && openSlots.map((slot) => (
        <div
          key={slot.id}
          className={`w-4 h-4 rounded-full border-2 border-dashed flex items-center justify-center mt-0.5 ${getStyleDashedBorder(slot.contentStyle)}`}
        >
          <PlusIcon className="w-2 h-2" />
        </div>
      ))}

      {/* Slots complétés : petite coche verte */}
      {completedSlots.map((slot) => (
        <div key={slot.id} className="w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
          <CheckIcon className="w-2 h-2 text-white" />
        </div>
      ))}
    </button>
  );
}
