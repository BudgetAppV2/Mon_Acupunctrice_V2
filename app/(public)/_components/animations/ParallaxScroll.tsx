'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

interface ParallaxScrollProps {
  children: ReactNode;
  /** Vitesse relative au scroll. -0.2 = element bouge 20% plus lentement vers le haut. */
  speed?: number;
  className?: string;
}

/**
 * Parallax leger : l'element bouge plus lentement (ou plus vite) que le scroll.
 * speed = -0.2 -> bouge 20% plus lentement vers le haut (effet profondeur).
 * speed = 0.2  -> bouge 20% plus vite (effet flottement).
 *
 * Subtil par design. Plus que +/- 0.3 = trop, casse la lecture.
 *
 * Usage (sur la photo hero) :
 *   <ParallaxScroll speed={-0.15}>
 *     <picture>...</picture>
 *   </ParallaxScroll>
 */
export default function ParallaxScroll({
  children,
  speed = -0.15,
  className,
}: ParallaxScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(() => {
    if (!ref.current || prefersReduced) return;

    const el = ref.current;
    const tween = gsap.to(el, {
      // Au fur et a mesure du scroll, on translate l'element
      // selon sa propre hauteur * speed
      yPercent: speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.5, // smooth — mouvement lerp 0.5s derriere le scroll
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, { dependencies: [prefersReduced, speed] });

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}
