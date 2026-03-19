'use client';

import { useState, useRef } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import type { ContentItem, WorkflowState } from '@/lib/types';
import { CATEGORY_LABELS, WORKFLOW_LABELS } from '@/lib/types';

const STATUS_COLORS: Record<WorkflowState, string> = {
  idea: 'bg-status-idea',
  planned: 'bg-status-planned',
  ready_to_shoot: 'bg-status-shot',
  shot: 'bg-status-shot',
  editing: 'bg-status-editing',
  ready: 'bg-status-ready',
};

interface Props {
  item: ContentItem;
  onDelete: (id: string) => void;
}

export default function ContentCard({ item, onDelete }: Props) {
  const [offsetX, setOffsetX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startXRef = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return;
    const diff = e.touches[0].clientX - startXRef.current;
    // Swipe gauche uniquement
    if (diff < 0) {
      setOffsetX(Math.max(diff, -120));
    }
  };

  const handleTouchEnd = () => {
    setSwiping(false);
    if (offsetX < -80) {
      setOffsetX(-400);
      setTimeout(() => onDelete(item.id), 200);
    } else {
      setOffsetX(0);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      <div className="absolute inset-y-0 right-0 flex items-center justify-center w-20 bg-red-500 rounded-r-lg">
        <TrashIcon className="w-5 h-5 text-white" />
      </div>

      <div
        className="relative bg-white border border-gray-100 rounded-lg p-4"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: swiping ? 'none' : 'transform 0.2s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {item.title}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {CATEGORY_LABELS[item.category]}
            </p>
          </div>
          <span
            className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium text-white ${STATUS_COLORS[item.workflowState]}`}
          >
            {WORKFLOW_LABELS[item.workflowState]}
          </span>
        </div>
      </div>
    </div>
  );
}
