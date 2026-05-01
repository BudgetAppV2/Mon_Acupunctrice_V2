'use client';

import { useLayoutEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// CRITIQUE : enregistrer le plugin AU NIVEAU MODULE (a l'import du fichier).
// Sinon useGSAP dans les sections enfants (qui utilise useLayoutEffect)
// cree ses ScrollTriggers avant que useEffect ait registre le plugin,
// et tous les triggers se declenchent immediatement.
//
// LenisProvider est importe en premier dans page.tsx, donc son module est
// evalue AVANT les sections — le plugin est registered avant tout.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * LenisProvider — smooth scroll + sync ScrollTrigger.
 *
 * Utilise useLayoutEffect pour s'assurer que Lenis est initialise AVANT que
 * les autres useEffects/useLayoutEffects des composants enfants s'executent.
 *
 * Plusieurs ScrollTrigger.refresh() sont appeles a des moments differents
 * pour gerer les cas ou le DOM n'est pas stable au mount (images qui chargent,
 * fonts qui chargent, layout qui shift).
 */
export default function LenisProvider() {
  useLayoutEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      lerp: 0.1,
      autoRaf: false,
      smoothWheel: true,
      touchMultiplier: 2,
    });

    // Sync ScrollTrigger avec Lenis
    lenis.on('scroll', ScrollTrigger.update);

    // GSAP gere le RAF loop unique
    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Refresh #1 : immediatement apres init Lenis
    ScrollTrigger.refresh();

    // Refresh #2 : apres que la window soit completement chargee
    // (images, fonts externes, etc.) — important pour les positions accurate
    const onLoad = () => ScrollTrigger.refresh();
    if (document.readyState === 'complete') {
      // Deja charge, refresh apres un tick pour laisser le layout se stabiliser
      requestAnimationFrame(() => ScrollTrigger.refresh());
    } else {
      window.addEventListener('load', onLoad);
    }

    // Refresh #3 : apres 500ms en garantie (au cas ou des fonts chargeraient tard)
    const timeoutId = window.setTimeout(() => ScrollTrigger.refresh(), 500);

    return () => {
      window.removeEventListener('load', onLoad);
      window.clearTimeout(timeoutId);
      gsap.ticker.remove(tick);
      lenis.destroy();
      gsap.ticker.lagSmoothing(500, 33);
      ScrollTrigger.refresh();
    };
  }, []);

  return null;
}
