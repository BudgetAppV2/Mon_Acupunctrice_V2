import { DEFAULT_CATEGORIES } from '@/lib/types';

/** Retourne toutes les categories (defaut + custom) */
export function getAllCategories(customCategories: string[]): { value: string; label: string }[] {
  const customs = customCategories.map(c => ({ value: c, label: c }));
  return [...DEFAULT_CATEGORIES, ...customs];
}

/** Label d'affichage : les categories par defaut ont un label traduit, les custom = leur propre nom */
export function getCategoryLabel(value: string): string {
  const found = DEFAULT_CATEGORIES.find(c => c.value === value);
  return found ? found.label : value;
}
