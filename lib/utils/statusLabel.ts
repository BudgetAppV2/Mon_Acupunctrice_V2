import { WORKFLOW_LABELS, type ContentItem } from '@/lib/types';

export function getStatusLabel(item: ContentItem): string {
  if (item.distributionStatus === 'published') return 'Publiee';
  if (item.distributionStatus === 'scheduled') return 'Planifiee';
  if (item.distributionStatus === 'publishing') return 'Publication...';
  if (item.distributionStatus === 'failed') return 'Echouee';
  return WORKFLOW_LABELS[item.workflowState];
}

export function getStatusColor(item: ContentItem): string {
  if (item.distributionStatus === 'published') return 'bg-emerald-500';
  if (item.distributionStatus === 'scheduled') return 'bg-blue-500';
  if (item.distributionStatus === 'publishing') return 'bg-amber-500';
  if (item.distributionStatus === 'failed') return 'bg-red-500';
  const colors: Record<string, string> = {
    idea: 'bg-gray-400', planned: 'bg-blue-400', ready_to_shoot: 'bg-amber-400',
    shot: 'bg-orange-400', editing: 'bg-purple-400', ready: 'bg-emerald-500',
  };
  return colors[item.workflowState] || 'bg-gray-400';
}
