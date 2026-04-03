'use client';

import type { ContentItem } from '@/lib/types';
import { ArrowLeftIcon, ArrowTopRightOnSquareIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface Props {
  item: ContentItem;
  onBack: () => void;
}

function fmt(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(0)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function formatDate(ts: ContentItem['publishedAt']): string {
  if (!ts) return '';
  const ms = 'toMillis' in ts ? ts.toMillis() : 0;
  if (ms === 0) return '';
  const d = new Date(ms);
  const months = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'];
  return `Publie le ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

const PLATFORMS = [
  { key: 'instagramPostId' as const, label: 'Instagram', dotColor: 'bg-pink-500' },
  { key: 'facebookPostId' as const, label: 'Facebook', dotColor: 'bg-blue-600' },
  { key: 'youtubeVideoId' as const, label: 'YouTube', dotColor: 'bg-red-500' },
] as const;

export default function PublicationDetail({ item, onBack }: Props) {
  const ins = item.insights;
  const thumb = item.coverImageUrl || item.thumbnailUrl;

  const metrics = [
    { label: 'Vues', value: ins?.plays || 0 },
    { label: 'Likes', value: ins?.likes || 0 },
    { label: 'Commentaires', value: ins?.comments || 0 },
    { label: 'Partages', value: ins?.shares || 0 },
    { label: 'Enregistrements', value: ins?.saved || 0 },
    { label: 'Portee', value: ins?.reach || 0 },
  ];

  return (
    <div className="min-h-screen bg-sand pb-24">
      <header className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
        <button onClick={onBack} className="p-1"><ArrowLeftIcon className="w-5 h-5 text-gray-600" /></button>
        <h1 className="text-lg font-semibold text-sage">Detail publication</h1>
      </header>

      <div className="px-4 pt-4 space-y-4">
        {/* Thumbnail */}
        {thumb && (
          <div className="flex justify-center">
            <img src={thumb} alt="" className="max-h-48 rounded-xl object-cover" style={{ aspectRatio: '9/16' }} />
          </div>
        )}

        {/* Title + date */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{item.title || 'Sans titre'}</h2>
          <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(item.publishedAt)}</p>
        </div>

        {/* Platforms */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Plateformes</p>
          {PLATFORMS.map(p => {
            const published = !!item[p.key];
            return (
              <div key={p.key} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${p.dotColor}`} />
                <span className="text-[11px] text-gray-700 flex-1">{p.label}</span>
                {published
                  ? <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                  : <XCircleIcon className="w-4 h-4 text-gray-300" />
                }
              </div>
            );
          })}
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-3 gap-2">
          {metrics.map(m => (
            <div key={m.label} className="bg-white rounded-xl px-3 py-2.5 text-center">
              <p className="text-lg font-bold text-gray-900">{fmt(m.value)}</p>
              <p className="text-[10px] text-gray-500">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Per-platform metrics */}
        {(ins?.facebookViews || ins?.youtubeViews) && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Par plateforme</p>
            {ins?.facebookViews !== undefined && ins.facebookViews > 0 && (
              <div className="flex items-center gap-2 text-[11px]">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="text-gray-700 flex-1">Facebook</span>
                <span className="text-gray-500">{fmt(ins.facebookViews)} vues</span>
              </div>
            )}
            {ins?.youtubeViews !== undefined && ins.youtubeViews > 0 && (
              <div className="flex items-center gap-2 text-[11px]">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-gray-700 flex-1">YouTube</span>
                <span className="text-gray-500">
                  {fmt(ins.youtubeViews)} vues
                  {ins.youtubeLikes ? ` / ${fmt(ins.youtubeLikes)} likes` : ''}
                  {ins.youtubeComments ? ` / ${fmt(ins.youtubeComments)} com.` : ''}
                </span>
              </div>
            )}
          </div>
        )}

        {/* External links */}
        <div className="space-y-2">
          {item.instagramPostId && (
            <a href={`https://www.instagram.com/reel/${item.instagramPostId}/`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sage text-[11px] font-medium">
              <ArrowTopRightOnSquareIcon className="w-4 h-4" /> Voir sur Instagram
            </a>
          )}
          {item.facebookPostId && (
            <a href={`https://www.facebook.com/${item.facebookPostId}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sage text-[11px] font-medium">
              <ArrowTopRightOnSquareIcon className="w-4 h-4" /> Voir sur Facebook
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
