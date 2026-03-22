'use client';

import type { ContentItem } from '@/lib/types';
import { EyeIcon, HeartIcon } from '@heroicons/react/24/outline';

interface Props { items: ContentItem[] }

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

/** Liste compacte des top Reels par engagement */
export default function TopReelsList({ items }: Props) {
  if (items.length === 0) return <p className="text-xs text-gray-400 text-center py-4">Pas encore de donnees</p>;

  return (
    <div className="space-y-2">
      {items.slice(0, 3).map((item, i) => {
        const ins = item.insights;
        const engagement = (ins?.likes || 0) + (ins?.comments || 0) + (ins?.shares || 0) + (ins?.saved || 0);
        return (
          <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-3">
            <span className="text-lg font-bold text-sage/50 w-6 text-center">{i + 1}</span>
            {(item.coverImageUrl || item.thumbnailUrl) && (
              <img src={(item.coverImageUrl || item.thumbnailUrl)!} alt="" className="w-9 h-14 object-cover rounded" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 text-[10px] text-gray-500"><EyeIcon className="w-3 h-3" />{fmt(ins?.plays || 0)}</span>
                <span className="flex items-center gap-1 text-[10px] text-gray-500"><HeartIcon className="w-3 h-3" />{fmt(engagement)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
