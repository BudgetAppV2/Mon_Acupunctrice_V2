'use client';

import { useDailyAnalytics, useTopReels, useInsightsSummary } from '@/lib/hooks/useAnalytics';
import { ChartBarIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import ReachChart from '@/components/features/stats/ReachChart';
import TopReelsList from '@/components/features/stats/TopReelsList';
import ReelsBarChart from '@/components/features/stats/ReelsBarChart';

export default function StatsPage() {
  const summary = useInsightsSummary();
  const daily = useDailyAnalytics(30);
  const topReels = useTopReels(5);

  const hasData = summary.publishCount > 0;

  return (
    <div className="min-h-screen bg-sand pb-24">
      <header className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
        <Link href="/profil" className="p-1"><ArrowLeftIcon className="w-5 h-5 text-gray-600" /></Link>
        <h1 className="text-lg font-semibold text-sage">Statistiques</h1>
      </header>

      <div className="px-4 pt-4 space-y-6">
        {!hasData && !summary.loading ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <ChartBarIcon className="w-12 h-12 text-sage/40 mb-4" />
            <h2 className="text-base font-semibold text-gray-900 mb-1">Tes stats arrivent bientot</h2>
            <p className="text-sm text-gray-400 text-center">
              Tes statistiques apparaitront 24h apres ta premiere publication. En attendant, prepare ton prochain Reel!
            </p>
          </div>
        ) : (
          <>
            <section>
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Performance des Reels</h2>
              <ReelsBarChart items={topReels.data} />
            </section>

            {daily.data.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-700 mb-2">Portee quotidienne (30j)</h2>
                <ReachChart data={daily.data} />
              </section>
            )}

            <section>
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Top Reels</h2>
              <TopReelsList items={topReels.data} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
