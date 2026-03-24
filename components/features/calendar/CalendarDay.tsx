'use client';

import type { ContentItem, WorkflowState, CalendarSlot } from '@/lib/types';

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
  slots?: CalendarSlot[];
  isCurrentMonth: boolean;
  isToday: boolean;
  onTap: (date: Date, items: ContentItem[]) => void;
}

export default function CalendarDay({ date, items, slots, isCurrentMonth, isToday, onTap }: Props) {
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

  // Badge de séquence : premier slot avec un rôle de séquence dans ce jour
  const sequenceSlot = slots?.find((s) => s.sequenceRole && s.sequencePosition && s.sequenceLength);

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
        items.length > 1 ? (
          <span className="text-[9px] font-bold text-sage bg-sage/10 w-4 h-4 flex items-center justify-center rounded-full mt-0.5">
            {items.length}
          </span>
        ) : (
          <div className={`w-1.5 h-1.5 rounded-full mt-1 ${DOT_COLORS[items[0].workflowState] ?? 'bg-gray-400'}`} />
        )
      )}

      {thumbnail && (
        <img
          src={thumbnail}
          alt=""
          className="w-8 h-8 mt-0.5 rounded object-cover"
        />
      )}

      {/* Badge position dans la séquence blogue, ex : "2/4" */}
      {sequenceSlot && (
        <span className="text-[8px] font-bold text-white bg-sage/80 px-1 rounded mt-0.5 leading-tight">
          {sequenceSlot.sequencePosition}/{sequenceSlot.sequenceLength}
        </span>
      )}
    </button>
  );
}
