'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import type { ContentItem } from '@/lib/types';

interface Props { items: ContentItem[] }

/** BarChart horizontal : top Reels par nombre de vues */
export default function ReelsBarChart({ items }: Props) {
  if (items.length === 0) return <p className="text-xs text-gray-400 text-center py-4">Pas encore de donnees</p>;

  const data = items.map(i => ({
    name: (i.title || '').slice(0, 20) || 'Sans titre',
    plays: i.insights?.plays || 0,
  }));

  return (
    <div className="bg-white rounded-xl p-3">
      <ResponsiveContainer width="100%" height={items.length * 40 + 20}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
          <XAxis type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} />
          <Tooltip formatter={(v) => [v, 'Vues']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Bar dataKey="plays" fill="#87A878" radius={[0, 4, 4, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
