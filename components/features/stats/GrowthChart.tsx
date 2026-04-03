'use client';

import { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';

interface DailyEntry { date: string; followerCount: number; reach: number }
type Metric = 'followers' | 'reach';

interface Props { data: DailyEntry[] }

function formatDate(d: string): string {
  const [, m, day] = d.split('-');
  const months = ['', 'jan', 'fev', 'mar', 'avr', 'mai', 'jun', 'jul', 'aou', 'sep', 'oct', 'nov', 'dec'];
  return `${+day} ${months[+m] || ''}`;
}

const METRICS: { value: Metric; label: string }[] = [
  { value: 'followers', label: 'Abonnes' },
  { value: 'reach', label: 'Portee' },
];

export default function GrowthChart({ data }: Props) {
  const [metric, setMetric] = useState<Metric>('followers');

  if (data.length === 0) return null;

  const dataKey = metric === 'followers' ? 'followerCount' : 'reach';
  const tooltipLabel = metric === 'followers' ? 'Abonnes' : 'Portee';

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-700">Tendance</h2>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {METRICS.map(m => (
            <button key={m.value} onClick={() => setMetric(m.value)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition ${
                metric === m.value ? 'bg-sage text-white shadow-sm' : 'text-gray-500'
              }`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl p-3">
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="sageFillGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#87A878" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#87A878" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tickFormatter={formatDate}
              tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false}
              interval="preserveStartEnd" />
            <Tooltip labelFormatter={(d) => formatDate(String(d))}
              formatter={(v) => [v, tooltipLabel]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
            <Area type="monotone" dataKey={dataKey} stroke="#87A878" fill="url(#sageFillGrowth)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
