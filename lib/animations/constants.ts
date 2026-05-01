/**
 * Constantes centralisees pour les animations du site Judith.
 * Modifier ICI plutot qu'inline pour garder une coherence globale.
 *
 * VERSION AUDACIEUSE :
 * - Distances doublees (16 -> 32)
 * - Durees plus dramatiques (600ms -> 900ms)
 * - Easing power3.out
 * - Stagger plus visible (80ms -> 120ms)
 *
 * Note : le plugin ScrollTrigger est enregistre dans LenisProvider.tsx (au top
 * du module, donc avant le rendu des sections enfants).
 */
export const ANIMATION = {
  // Durees (en secondes pour GSAP)
  duration: {
    short: 0.4,    // hover, micro-interactions
    medium: 0.9,   // reveal standard (etait 0.6)
    long: 1.4,     // hero entrance (etait 1.2)
    breathe: 6.0,  // botanical floating cycle (etait 4.0)
    bgShift: 12.0, // background gradient cycle
  },

  // Easings (GSAP eases natifs)
  ease: {
    out: 'power3.out',         // standard reveal (etait power2.out)
    smoothOut: 'power3.out',
    inOut: 'sine.inOut',       // floating, breathing
  },

  // Distances de translation (en pixels)
  translate: {
    subtle: 12,      // micro elements (etait 8)
    standard: 32,    // reveal standard (etait 16)
    pronounced: 56,  // CTA section finale (etait 32)
  },

  // Stagger entre enfants (en secondes)
  stagger: {
    fast: 0.06,     // etait 0.05
    standard: 0.12, // etait 0.08
    slow: 0.16,     // etait 0.1
  },

  // ScrollTrigger
  trigger: {
    start: 'top 85%',
    once: true,
  },
} as const;
