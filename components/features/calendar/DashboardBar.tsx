'use client';

import { useContentItems } from '@/lib/hooks/useContentItems';

export default function DashboardBar() {
  const { data, loading } = useContentItems();

  if (loading) return null;

  const stats = { ideas: 0, ready: 0, scheduled: 0, published: 0 };

  for (const item of data) {
    if (item.distributionStatus === 'published') stats.published++;
    else if (item.distributionStatus === 'scheduled') stats.scheduled++;
    else if (item.workflowState === 'ready') stats.ready++;
    else stats.ideas++;
  }

  return (
    <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
      <Pill count={stats.published} label="Publiés" color="text-status-published" />
      <Pill count={stats.scheduled} label="Planifiés" color="text-status-planned" />
      <Pill count={stats.ready} label="Prêts" color="text-status-ready" />
      <Pill count={stats.ideas} label="Idées" color="text-status-idea" />
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
