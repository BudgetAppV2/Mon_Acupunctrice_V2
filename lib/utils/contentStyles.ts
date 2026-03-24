import type { ContentStyle } from '@/lib/types';

export const CONTENT_STYLES: { value: ContentStyle; label: string; color: string }[] = [
  { value: 'enseigner', label: 'Enseigner', color: '#3b82f6' }, // blue-500
  { value: 'connecter', label: 'Connecter', color: '#22c55e' }, // green-500
  { value: 'aider',     label: 'Aider',     color: '#eab308' }, // yellow-500
  { value: 'inspirer',  label: 'Inspirer',  color: '#a855f7' }, // purple-500
];

/** Retourne la couleur hex associée à un style de contenu. */
export function getStyleColor(style: ContentStyle): string {
  return CONTENT_STYLES.find((s) => s.value === style)?.color ?? '#9ca3af';
}
