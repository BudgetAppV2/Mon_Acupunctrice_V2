'use client';

import type { ContentItem } from '@/lib/types';
import { EyeIcon, HeartIcon } from '@heroicons/react/24/outline';

interface Props {
  item: ContentItem;
  onTap: () => void;
}

function fmt(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(0)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function relativeDate(ts: ContentItem['publishedAt']): string {
  if (!ts) return '';
  const ms = 'toMillis' in ts ? ts.toMillis() : 0;
  if (ms === 0) return '';
  const days = Math.floor((Date.now() - ms) / 86400000);
  if (days === 0) return "aujourd'hui";
  if (days === 1) return 'hier';
  return `il y a ${days}j`;
}

export default function PublicationCard({ item, onTap }: Props) {
  const ins = item.insights;
  const engagement = ins ? (ins.likes || 0) + (ins.comments || 0) + (ins.shares || 0) + (ins.saved || 0) : 0;
  const thumb = item.coverImageUrl || item.thumbnailUrl;

  return (
    <button onClick={onTap} className="w-full bg-white rounded-xl p-2.5 flex items-center gap-2.5 text-left active:bg-gray-50 transition">
      {/* Thumbnail */}
      {thumb ? (
        <img src={thumb} alt="" className="w-11 h-16 object-cover rounded shrink-0" />
      ) : (
        <div className="w-11 h-16 bg-gray-100 rounded shrink-0" />
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.title || 'Sans titre'}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {/* Platform dots */}
          {item.instagramPostId && <div className="w-1.5 h-1.5 rounded-full bg-pink-500" title="Instagram" />}
          {item.facebookPostId && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" title="Facebook" />}
          {item.youtubeVideoId && <div className="w-1.5 h-1.5 rounded-full bg-red-500" title="YouTube" />}
          <span className="text-[10px] text-gray-400 ml-0.5">{relativeDate(item.publishedAt)}</span>
        </div>
      </div>

      {/* Metrics */}
      {ins && (
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          <span className="flex items-center gap-1 text-[11px] text-gray-600 font-medium">
            <EyeIcon className="w-3 h-3 text-gray-400" />{fmt(ins.plays || 0)}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-gray-400">
            <HeartIcon className="w-3 h-3" />{fmt(engagement)}
          </span>
        </div>
      )}
    </button>
  );
}
