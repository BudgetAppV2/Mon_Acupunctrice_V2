'use client';

import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';

interface Props {
  label: string;
  value: number;
  trend?: number;
  icon: React.ComponentType<{ className?: string }>;
}

function fmt(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(0)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function SummaryCard({ label, value, trend, icon: Icon }: Props) {
  return (
    <div className="bg-white rounded-xl px-3 py-2.5 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <Icon className="w-4 h-4 text-sage/50" />
        {trend !== undefined && trend !== 0 && (
          <span className={`flex items-center gap-0.5 text-[10px] font-medium ${trend > 0 ? 'text-emerald-500' : 'text-red-400'}`}>
            {trend > 0 ? <ArrowTrendingUpIcon className="w-3 h-3" /> : <ArrowTrendingDownIcon className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <span className="text-xl font-bold text-gray-900">{fmt(value)}</span>
      <span className="text-[10px] text-gray-500">{label}</span>
    </div>
  );
}
