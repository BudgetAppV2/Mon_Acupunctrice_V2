'use client';

import { useState, useRef } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import type { ContentItem } from '@/lib/types';
import { getCategoryLabel } from '@/lib/utils/categories';
import { getStyleColor } from '@/lib/utils/contentStyles';
import { getStatusLabel, getStatusColor } from '@/lib/utils/statusLabel';

interface Props {
  item: ContentItem;
  onDelete: (id: string) => void;
  onClick: () => void;
}

export default function ContentCard({ item, onDelete, onClick }: Props) {
  const [offsetX, setOffsetX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startXRef = useRef(0);
  const swipedRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    setSwiping(true);
    swipedRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return;
    const diff = e.touches[0].clientX - startXRef.current;
    if (Math.abs(diff) > 10) swipedRef.current = true;
    if (diff < 0) setOffsetX(Math.max(diff, -120));
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

  // Ne pas ouvrir le detail si on vient de swiper
  const handleClick = () => { if (!swipedRef.current) onClick(); };

  return (
    <div className="relative overflow-hidden rounded-lg">
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-center w-20 bg-red-500 rounded-r-lg transition-opacity"
        style={{ opacity: Math.min(1, Math.abs(offsetX) / 80) }}
      >
        <TrashIcon className="w-5 h-5 text-white" />
      </div>

      <div
        className="relative bg-white border border-gray-100 rounded-lg p-4"
        style={{ transform: `translateX(${offsetX}px)`, transition: swiping ? 'none' : 'transform 0.2s ease-out' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">{item.title}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-xs text-gray-500">{getCategoryLabel(item.category)}</p>
              {item.contentStyle && (
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: getStyleColor(item.contentStyle) }}
                />
              )}
            </div>
          </div>
          <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(item)}`}>
            {getStatusLabel(item)}
          </span>
        </div>
      </div>
    </div>
  );
}
