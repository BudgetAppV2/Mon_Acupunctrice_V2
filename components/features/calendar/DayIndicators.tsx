'use client';

import React, { memo } from 'react';
import { SparklesIcon, BookOpenIcon, CheckIcon } from '@heroicons/react/24/solid';
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
    <div className="flex items-center gap-0.5 mt-0.5 justify-center flex-wrap">
      {visible.map((dot) => <DotNode key={dot.key} dot={dot} />)}
      {overflow > 0 && (
        <span className="text-[8px] font-bold text-gray-500">+{overflow}</span>
      )}
    </div>
  );
}

function DotNode({ dot }: { dot: Dot }) {
  const color = dot.style ? getStyleColor(dot.style) : '#9ca3af';

  if (dot.kind === 'item') {
    return <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: color }} />;
  }

  // Slot skipped — grisé discret
  if (dot.status === 'skipped') {
    return <span className="w-1.5 h-1.5 rounded-full bg-gray-300 opacity-50 inline-block" />;
  }

  // Slot auto-publish — icône SparklesIcon
  if (dot.autoPublish) {
    return (
      <span className="relative inline-flex items-center justify-center">
        <SparklesIcon className="w-2 h-2" style={{ color }} />
        {dot.sequenceRole && <BookOpenIcon className="absolute -bottom-1 -right-1 w-1.5 h-1.5 text-gray-500" />}
      </span>
    );
  }

  // Slot open — outline pointillé
  if (dot.status === 'open') {
    return <span className="w-1.5 h-1.5 rounded-full inline-block border border-dashed" style={{ borderColor: color }} />;
  }

  // Slot completed — pastille + checkmark
  if (dot.status === 'completed') {
    return (
      <span className="relative inline-flex">
        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: color }} />
        <CheckIcon className="absolute -top-0.5 -right-0.5 w-1 h-1 text-white" />
        {dot.sequenceRole && <BookOpenIcon className="absolute -bottom-1 -right-0.5 w-1.5 h-1.5 text-gray-500" />}
      </span>
    );
  }

  // Slot filled
  return (
    <span className="relative inline-flex">
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: color }} />
      {dot.sequenceRole && <BookOpenIcon className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 text-gray-500" />}
    </span>
  );
}

export default memo(DayIndicators);
