'use client';

import { ChartBarIcon } from '@heroicons/react/24/outline';

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-sand">
      <header className="px-4 py-3 bg-white border-b border-gray-200">
        <h1 className="text-lg font-semibold text-sage">Statistiques</h1>
      </header>
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <ChartBarIcon className="w-12 h-12 text-sage/40 mb-4" />
        <h2 className="text-base font-semibold text-gray-900 mb-1">Tes stats arrivent bientot</h2>
        <p className="text-sm text-gray-400 text-center">
          On prepare un tableau de bord pour suivre tes performances.
        </p>
      </div>
    </div>
  );
}
