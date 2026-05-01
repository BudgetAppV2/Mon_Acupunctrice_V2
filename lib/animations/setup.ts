'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Enregistre le plugin a l'import du module (executed before any component effect).
// Cela garantit que tous les useGSAP qui utilisent ScrollTrigger fonctionnent
// correctement, peu importe l'ordre des useEffect/useLayoutEffect.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

let registered = true; // marque comme registered (l'import a fait le travail)

export function setupGsap(): void {
  // No-op : le plugin est deja registered au niveau module.
  // Garde pour retrocompat avec GsapBootstrap qui appelle ca.
  if (!registered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
}
