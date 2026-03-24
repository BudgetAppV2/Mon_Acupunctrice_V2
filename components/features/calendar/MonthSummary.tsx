'use client';

import React, { memo, useMemo } from 'react';
import { CONTENT_STYLES, getStyleColor } from '@/lib/utils/contentStyles';
import type { ContentItem, CalendarSlot, ContentStyle } from '@/lib/types';

interface Props {
  items: ContentItem[];
  slots: CalendarSlot[];
}

function MonthSummary({ items, slots }: Props) {
  const counts = useMemo(() => {
    const map: Record<ContentStyle, number> = { enseigner: 0, connecter: 0, aider: 0, inspirer: 0 };
    for (const item of items) { if (item.contentStyle) map[item.contentStyle]++; }
    for (const slot of slots) { if (slot.status !== 'skipped') map[slot.contentStyle]++; }
    return map;
  }, [items, slots]);

  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  if (total === 0) return null;

  // Détecte un déséquilibre : un style représente plus de 60% du total
  const dominant = CONTENT_STYLES.find((s) => counts[s.value] / total > 0.6);
  const least    = dominant
    ? CONTENT_STYLES.reduce((min, s) => counts[s.value] < counts[min.value] ? s : min, CONTENT_STYLES[0])
    : null;

  return (
    <div className="px-4 pb-2">
      <div className="flex gap-3 items-center">
        {CONTENT_STYLES.map((s) => (
          <div key={s.value} className="flex items-center gap-1">
            <span
              className="w-5 h-5 rounded-full flex-shrink-0"
              style={{ backgroundColor: getStyleColor(s.value) }}
            />
            <span className="text-xs text-gray-600 font-medium">{counts[s.value]}</span>
          </div>
        ))}
      </div>
      {dominant && least && (
        <p className="text-[10px] text-gray-400 mt-1">
          Beaucoup de {dominant.label} ce mois-ci — essaie un {least.label}?
        </p>
      )}
    </div>
  );
}

export default memo(MonthSummary);
