import { WORKFLOW_LABELS, type ContentItem } from '@/lib/types';

export function getStatusLabel(item: ContentItem): string {
  if (item.distributionStatus === 'published') return 'Publiee';
  if (item.distributionStatus === 'scheduled') return 'Planifiee';
  if (item.distributionStatus === 'publishing') return 'Publication...';
  if (item.distributionStatus === 'failed') return 'Echouee';
  return WORKFLOW_LABELS[item.workflowState];
}

export function getStatusColor(item: ContentItem): string {
  if (item.distributionStatus === 'published') return 'bg-status-published';
  if (item.distributionStatus === 'scheduled') return 'bg-status-planned';
  if (item.distributionStatus === 'publishing') return 'bg-status-editing';
  if (item.distributionStatus === 'failed') return 'bg-red-500';
  // These classes map to custom colors in tailwind.config.ts
  const colors: Record<string, string> = {
    idea: 'bg-status-idea',
    planned: 'bg-status-planned',
    ready_to_shoot: 'bg-status-shot',
    shot: 'bg-status-shot',
    editing: 'bg-status-editing',
    ready: 'bg-status-ready',
  };
  return colors[item.workflowState] || 'bg-status-idea';
}
