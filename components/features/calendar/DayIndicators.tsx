'use client';

import React, { memo } from 'react';
import { SparklesIcon, BookOpenIcon, CheckIcon, PlusIcon } from '@heroicons/react/24/solid';
import { getStyleColor } from '@/lib/utils/contentStyles';
import type { ContentItem, CalendarSlot, ContentStyle } from '@/lib/types';

interface Props {
  items: ContentItem[];
  slots: CalendarSlot[];
}

type Dot =
  | { key: string; kind: 'item'; style?: ContentStyle }
  | { key: string; kind: 'slot'; style: ContentStyle; status: 'open' | 'filled' | 'completed' | 'skipped'; autoPublish?: boolean; sequenceRole?: string };

function DayIndicators({ items, slots }: Props) {
  const dots: Dot[] = [
    ...items.map((item, i): Dot => ({ key: `i${i}`, kind: 'item', style: item.contentStyle })),
    ...slots.map((slot, i): Dot => ({
      key: `s${i}`, kind: 'slot',
      style: slot.contentStyle,
      status: slot.status,
      autoPublish: slot.autoPublish,
      sequenceRole: slot.sequenceRole,
    })),
  ];

  if (dots.length === 0) return null;

  const visible = dots.slice(0, 3);
  const overflow = dots.length - 3;

  return (
    <div className="flex items-center gap-1 mt-0.5 justify-center flex-wrap">
      {visible.map((dot) => <DotNode key={dot.key} dot={dot} />)}
      {overflow > 0 && (
        <span className="text-[8px] font-bold text-gray-500">+{overflow}</span>
      )}
    </div>
  );
}

function DotNode({ dot }: { dot: Dot }) {
  const color = dot.style ? getStyleColor(dot.style) : '#9ca3af';

  // Content item — pastille pleine
  if (dot.kind === 'item') {
    return <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />;
  }

  // Slot skipped — grisé discret (petit)
  if (dot.status === 'skipped') {
    return <span className="w-2 h-2 rounded-full bg-gray-300 opacity-40 inline-block" />;
  }

  // Slot auto-publish (story séquence) — icône sparkle colorée
  if (dot.autoPublish) {
    return (
      <span className="relative inline-flex items-center justify-center">
        <SparklesIcon className="w-3.5 h-3.5" style={{ color }} />
      </span>
    );
  }

  // Slot open — cercle pointillé coloré avec petit +
  if (dot.status === 'open') {
    return (
      <span
        className="w-3 h-3 rounded-full inline-flex items-center justify-center"
        style={{ border: `1.5px dashed ${color}` }}
      >
        <PlusIcon className="w-2 h-2" style={{ color }} />
      </span>
    );
  }

  // Slot completed — pastille avec checkmark
  if (dot.status === 'completed') {
    return (
      <span className="relative inline-flex">
        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
        <CheckIcon className="absolute -top-0.5 -right-0.5 w-2 h-2 text-white" />
      </span>
    );
  }

  // Slot filled — pastille pleine
  return (
    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: color }} />
  );
}

export default memo(DayIndicators);
