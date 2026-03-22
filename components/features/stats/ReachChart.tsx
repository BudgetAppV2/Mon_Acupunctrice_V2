'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface DailyEntry { date: string; reach: number }
interface Props { data: DailyEntry[] }

function formatDate(d: string): string {
  const [, m, day] = d.split('-');
  const months = ['', 'jan', 'fev', 'mar', 'avr', 'mai', 'jun', 'jul', 'aou', 'sep', 'oct', 'nov', 'dec'];
  return `${+day} ${months[+m]}`;
}

/** Graphique en aire : portée quotidienne sur 30 jours */
export default function ReachChart({ data }: Props) {
  if (data.length === 0) return <p className="text-xs text-gray-400 text-center py-4">Pas encore de donnees</p>;

  return (
    <div className="bg-white rounded-xl p-3">
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="sageFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#87A878" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#87A878" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
          <Tooltip labelFormatter={(d) => formatDate(String(d))} formatter={(v) => [v, 'Portee']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Area type="monotone" dataKey="reach" stroke="#87A878" fill="url(#sageFill)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
