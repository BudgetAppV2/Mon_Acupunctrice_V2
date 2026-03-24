import type { ContentStyle } from '@/lib/types';

export type PublishPlatform = 'instagram' | 'facebook' | 'youtube';

export const PLATFORM_RECOMMENDATIONS: Record<PublishPlatform, {
  idealDuration: [number, number];
  captionMaxChars: number;
  hashtagCount: number;
}> = {
  instagram: { idealDuration: [15, 30], captionMaxChars: 2200, hashtagCount: 4 },
  facebook: { idealDuration: [15, 60], captionMaxChars: 5000, hashtagCount: 0 },
  youtube: { idealDuration: [13, 60], captionMaxChars: 5000, hashtagCount: 0 },
};

export const STYLE_CTAS: Record<ContentStyle, Record<PublishPlatform, string>> = {
  enseigner: {
    instagram: 'Enregistre ce post pour plus tard',
    facebook: 'Partage si tu as appris quelque chose',
    youtube: 'Abonne-toi pour plus de conseils sante',
  },
  connecter: {
    instagram: 'Tu vis ca aussi? Dis-le en commentaire',
    facebook: 'Raconte-moi ton experience en commentaire',
    youtube: 'Dis-moi en commentaire si ca te parle',
  },
  aider: {
    instagram: 'Essaie et dis-moi comment ca s\'est passe',
    facebook: 'Essaie ce conseil et reviens me dire',
    youtube: 'Teste et partage ton experience',
  },
  inspirer: {
    instagram: 'Lien rendez-vous dans ma bio',
    facebook: 'Prends rendez-vous via le lien',
    youtube: 'Lien pour prendre rendez-vous dans la description',
  },
};

export function getDurationFeedback(
  durationSec: number,
  platform: PublishPlatform,
): { message: string; ok: boolean } {
  const rec = PLATFORM_RECOMMENDATIONS[platform];
  const [min, max] = rec.idealDuration;
  if (durationSec >= min && durationSec <= max)
    return { message: `${durationSec}s — Ideal pour ${platform}`, ok: true };
  if (durationSec < min)
    return { message: `${durationSec}s — Un peu court pour ${platform} (ideal: ${min}-${max}s)`, ok: false };
  return { message: `${durationSec}s — Un peu long pour ${platform} (ideal: ${min}-${max}s)`, ok: false };
}
