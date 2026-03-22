'use client';

import { useInsightsSummary } from '@/lib/hooks/useAnalytics';
import { EyeIcon, HeartIcon, UserGroupIcon, ChartBarIcon } from '@heroicons/react/24/outline';

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

/** 4 cartes stats compactes pour la page profil */
export default function StatsSummary() {
  const { totalPlays, totalReach, totalEngagement, publishCount, loading } = useInsightsSummary();

  if (loading) return null;

  if (publishCount === 0) {
    return (
      <div className="bg-white rounded-xl p-4 mb-4 text-center">
        <ChartBarIcon className="w-8 h-8 text-sage/40 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Publie ton premier Reel pour voir tes stats!</p>
      </div>
    );
  }

  const perWeek = publishCount > 0 ? (publishCount / 4).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      <div className="bg-white rounded-xl p-3">
        <EyeIcon className="w-4 h-4 text-sage mb-1" />
        <p className="text-lg font-bold text-gray-900">{fmt(totalPlays)}</p>
        <p className="text-[10px] text-gray-500">Vues (30j)</p>
      </div>
      <div className="bg-white rounded-xl p-3">
        <HeartIcon className="w-4 h-4 text-sage mb-1" />
        <p className="text-lg font-bold text-gray-900">{fmt(totalEngagement)}</p>
        <p className="text-[10px] text-gray-500">Engagement (30j)</p>
      </div>
      <div className="bg-white rounded-xl p-3">
        <UserGroupIcon className="w-4 h-4 text-sage mb-1" />
        <p className="text-lg font-bold text-gray-900">{fmt(totalReach)}</p>
        <p className="text-[10px] text-gray-500">Portee (30j)</p>
      </div>
      <div className="bg-white rounded-xl p-3">
        <ChartBarIcon className="w-4 h-4 text-sage mb-1" />
        <p className="text-lg font-bold text-gray-900">{perWeek}/sem</p>
        <p className="text-[10px] text-gray-500">Constance</p>
      </div>
    </div>
  );
}
