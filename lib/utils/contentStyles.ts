import type { ContentStyle } from '@/lib/types';

export const CONTENT_STYLES: { value: ContentStyle; label: string }[] = [
  { value: 'enseigner', label: 'Enseigner' },
  { value: 'connecter', label: 'Connecter' },
  { value: 'aider', label: 'Aider' },
  { value: 'inspirer', label: 'Inspirer' },
];

export function getStyleLabel(style: ContentStyle): string {
  const labels: Record<ContentStyle, string> = {
    enseigner: 'Enseigner',
    connecter: 'Connecter',
    aider: 'Aider',
    inspirer: 'Inspirer',
  };
  return labels[style];
}

// Fond + texte pour badge
export function getStyleBg(style: ContentStyle): string {
  const map: Record<ContentStyle, string> = {
    enseigner: 'bg-blue-50 text-blue-700',
    connecter: 'bg-green-50 text-green-700',
    aider: 'bg-amber-50 text-amber-700',
    inspirer: 'bg-purple-50 text-purple-700',
  };
  return map[style];
}

// Cercle plein (slot rempli, dot item)
export function getStyleDot(style: ContentStyle): string {
  const map: Record<ContentStyle, string> = {
    enseigner: 'bg-blue-400',
    connecter: 'bg-green-400',
    aider: 'bg-amber-400',
    inspirer: 'bg-purple-400',
  };
  return map[style];
}

// Bordure pointillée + couleur texte pour slot ouvert
export function getStyleDashedBorder(style: ContentStyle): string {
  const map: Record<ContentStyle, string> = {
    enseigner: 'border-blue-400 text-blue-400',
    connecter: 'border-green-400 text-green-400',
    aider: 'border-amber-400 text-amber-400',
    inspirer: 'border-purple-400 text-purple-400',
  };
  return map[style];
}
