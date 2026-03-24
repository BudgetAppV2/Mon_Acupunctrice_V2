import type { ContentStyle } from '@/lib/types';

export const CONTENT_STYLES: { value: ContentStyle; label: string; color: string }[] = [
  { value: 'enseigner', label: 'Enseigner', color: '#3B82F6' },  // blue-500
  { value: 'connecter', label: 'Connecter', color: '#22C55E' },  // green-500
  { value: 'aider',     label: 'Aider',     color: '#EAB308' },  // yellow-500
  { value: 'inspirer',  label: 'Inspirer',  color: '#A855F7' },  // purple-500
];

export function getStyleLabel(style?: ContentStyle): string {
  return CONTENT_STYLES.find(s => s.value === style)?.label ?? '';
}

export function getStyleColor(style?: ContentStyle): string {
  return CONTENT_STYLES.find(s => s.value === style)?.color ?? '#9CA3AF';
}
