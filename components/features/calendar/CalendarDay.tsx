'use client';

import type { ContentItem, WorkflowState } from '@/lib/types';

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
  isCurrentMonth: boolean;
  isToday: boolean;
  onTap: (date: Date, items: ContentItem[]) => void;
}

export default function CalendarDay({ date, items, isCurrentMonth, isToday, onTap }: Props) {
  // Jours hors du mois courant : décoratifs, non interactifs
  if (!isCurrentMonth) {
    return (
      <div className="flex flex-col items-center py-1 min-h-[48px]">
        <span className="text-xs font-medium w-6 h-6 flex items-center justify-center text-gray-300">
          {date.getDate()}
        </span>
      </div>
    );
  }

  const hasItems = items.length > 0;
  const thumbnail = items.find((i) => i.thumbnailUrl)?.thumbnailUrl;

  return (
    <button
      onClick={() => onTap(date, items)}
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

      {hasItems && !thumbnail && (
        <div className="flex gap-0.5 mt-1">
          {items.slice(0, 3).map((item, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[item.workflowState] ?? 'bg-gray-400'}`}
            />
          ))}
        </div>
      )}

      {thumbnail && (
        <img
          src={thumbnail}
          alt=""
          className="w-8 h-8 mt-0.5 rounded object-cover"
        />
      )}
    </button>
  );
}
