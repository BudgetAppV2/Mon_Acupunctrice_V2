import type { Pilier } from '@/lib/cover-generator/types';

const CATEGORY_TO_PILIER: Record<string, Pilier> = {
  'Fertilité': 'fertilite',
  'fertilité': 'fertilite',
  'fertilite': 'fertilite',
  'Grossesse': 'grossesse',
  'grossesse': 'grossesse',
  'Périnatalité': 'grossesse',
  'perinatalite': 'grossesse',
  'Pédiatrie': 'pediatrie',
  'pédiatrie': 'pediatrie',
  'pediatrie': 'pediatrie',
  'Acupuncture sociale': 'acupuncture-sociale',
  'acupuncture-sociale': 'acupuncture-sociale',
  'Ménopause': 'menopause',
  'ménopause': 'menopause',
  'menopause': 'menopause',
  'Anxiété': 'anxiete-sommeil',
  'Sommeil': 'anxiete-sommeil',
  'anxiete-sommeil': 'anxiete-sommeil',
};

export function detectPilierFromCategory(category?: string): Pilier {
  if (!category) return 'transversal';
  return CATEGORY_TO_PILIER[category] || 'transversal';
}
