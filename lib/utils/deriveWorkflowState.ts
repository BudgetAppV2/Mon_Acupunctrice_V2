import type { ContentItem, WorkflowState } from '@/lib/types';

/**
 * Derive automatiquement le workflowState a partir des champs du ContentItem.
 * Regles evaluees de haut en bas — premier match gagne.
 * Compatible avec les items existants (champs optionnels).
 */
export function deriveWorkflowState(item: Partial<ContentItem>): WorkflowState {
  // 1. Publie ou en cours de publication
  if (item.distributionStatus === 'published' ||
      item.distributionStatus === 'publishing' ||
      item.distributionStatus === 'failed') return 'ready';

  // 2. Planifie avec date
  if (item.distributionStatus === 'scheduled') return 'ready';

  // 3. Video exportee (exportedAt existe)
  if (item.videoUrl && item.exportedAt) return 'ready';

  // 4. Video importee + editeur touche
  if (item.videoUrl && item.editorTouchedAt) return 'editing';

  // 5. Video importee mais pas touchee
  if (item.videoUrl) return 'shot';

  // 5b. Video source uploadee mais pas exportee
  if (item.sourceVideoUrl) return 'shot';

  // 6. Date planifiee sans video
  if (item.scheduledAt) return 'planned';

  // 7. Defaut
  return 'idea';
}
