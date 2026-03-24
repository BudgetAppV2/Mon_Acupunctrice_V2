'use client';

import { FireIcon } from '@heroicons/react/24/solid';
import { useContentItems } from '@/lib/hooks/useContentItems';
import { useProgression } from '@/lib/hooks/useProgression';
import ProgressionCircle from './ProgressionCircle';

/** Calcule le debut et la fin de la semaine ISO courante en heure locale */
function getCurrentWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getDay(); // 0=dim, 1=lun ...
  const diffToMonday = (day === 0 ? -6 : 1 - day);
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

export default function DashboardBar() {
  const { data, loading } = useContentItems();
  const { progressData } = useProgression();

  if (loading) return null;

  const stats = { ideas: 0, ready: 0, scheduled: 0, published: 0 };
  for (const item of data) {
    if (item.distributionStatus === 'published') stats.published++;
    else if (item.distributionStatus === 'scheduled') stats.scheduled++;
    else if (item.workflowState === 'ready') stats.ready++;
    else stats.ideas++;
  }

  // Calcul X/Y pour la semaine courante
  const { start, end } = getCurrentWeekRange();
  let weekCompleted = 0;
  let weekTotal = 0;
  for (const item of data) {
    const ref = item.publishedAt ?? item.scheduledAt;
    if (!ref) continue;
    const d = ref.toDate();
    if (d >= start && d <= end) {
      weekTotal++;
      if (item.distributionStatus === 'published') weekCompleted++;
    }
  }

  const streak = progressData?.currentStreak ?? 0;

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      {/* Cercle progression semaine */}
      <ProgressionCircle completed={weekCompleted} total={Math.max(weekTotal, 1)} />

      {/* Pills resume */}
      <div className="flex gap-1.5 flex-1 overflow-x-auto scrollbar-hide">
        <Pill count={stats.published} label="Publies" color="text-status-published" />
        <Pill count={stats.scheduled} label="Planifies" color="text-status-planned" />
        <Pill count={stats.ready} label="Prets" color="text-status-ready" />
        <Pill count={stats.ideas} label="Idees" color="text-status-idea" />
      </div>

      {/* Badge serie — affiché seulement si streak > 0 */}
      {streak > 0 && (
        <div className="flex items-center gap-1 shrink-0 bg-orange-50 rounded-full px-2.5 py-1 border border-orange-100">
          <FireIcon className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-xs font-semibold text-orange-600">{streak}</span>
        </div>
      )}
    </div>
  );
}

function Pill({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0 bg-white rounded-full px-3 py-1 border border-gray-100">
      <span className={`text-sm font-semibold ${color}`}>{count}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}
