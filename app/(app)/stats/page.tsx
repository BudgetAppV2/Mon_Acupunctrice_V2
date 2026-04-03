'use client';

import { useState } from 'react';
import { useInsightsSummary, useDailyAnalytics } from '@/lib/hooks/useAnalytics';
import { ArrowLeftIcon, ChartBarIcon, EyeIcon, HeartIcon, ChatBubbleLeftIcon, ShareIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import SummaryCard from '@/components/features/stats/SummaryCard';

const PERIODS = [7, 30, 90] as const;
type Period = typeof PERIODS[number];

export default function StatsPage() {
  const [period, setPeriod] = useState<Period>(30);
  const summary = useInsightsSummary(period);
  const daily = useDailyAnalytics(period);

  const followerGain = daily.data.length >= 2
    ? daily.data[daily.data.length - 1].followerCount - daily.data[0].followerCount
    : 0;
  const latestFollowers = daily.data.length > 0 ? daily.data[daily.data.length - 1].followerCount : 0;

  return (
    <div className="min-h-screen bg-sand pb-24">
      <header className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
        <Link href="/profil" className="p-1"><ArrowLeftIcon className="w-5 h-5 text-gray-600" /></Link>
        <h1 className="text-lg font-semibold text-sage flex-1">Statistiques</h1>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                period === p ? 'bg-sage text-white shadow-sm' : 'text-gray-500'
              }`}>
              {p}j
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 pt-4 space-y-4">
        {!summary.loading && summary.publishCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <ChartBarIcon className="w-12 h-12 text-sage/40 mb-4" />
            <h2 className="text-base font-semibold text-gray-900 mb-1">Tes stats arrivent bientot</h2>
            <p className="text-sm text-gray-400 text-center">
              Tes statistiques apparaitront 24h apres ta premiere publication.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <SummaryCard label="Vues" value={summary.totalPlays} trend={summary.trends.plays} icon={EyeIcon} />
              <SummaryCard label="Likes" value={summary.totalLikes} icon={HeartIcon} />
              <SummaryCard label="Commentaires" value={summary.totalComments} icon={ChatBubbleLeftIcon} />
              <SummaryCard label="Partages" value={summary.totalShares} icon={ShareIcon} />
            </div>
            <SummaryCard label="Engagement total" value={summary.totalEngagement} trend={summary.trends.engagement} icon={ChartBarIcon} />

            {latestFollowers > 0 && (
              <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-3">
                <UserGroupIcon className="w-5 h-5 text-sage/50" />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-900">{latestFollowers.toLocaleString()}</span>
                  <span className="text-[11px] text-gray-500 ml-1.5">abonnes</span>
                </div>
                {followerGain !== 0 && (
                  <span className={`text-[11px] font-medium ${followerGain > 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                    {followerGain > 0 ? '+' : ''}{followerGain} ({period}j)
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
