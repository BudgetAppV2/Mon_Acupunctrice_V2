'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { ANIMATION } from '@/lib/animations/constants';

interface RevealProps {
  children: ReactNode;
  /** Distance verticale en px (default: 32) */
  y?: number;
  /** Duree en secondes (default: 0.9) */
  duration?: number;
  /** Delai en secondes (default: 0) */
  delay?: number;
  /** Easing (default: power3.out) */
  ease?: string;
  /** className pour le wrapper */
  className?: string;
  /** Tag HTML (default: div) */
  as?: 'div' | 'span' | 'section';
  /** Si fourni, scale de depart (ex: 0.7 -> grandit jusqu'a 1). Utile pour SectionNumber. */
  scaleFrom?: number;
}

/**
 * Reveal au scroll : fade-in + translate-Y subtil quand l'element entre en viewport.
 * Optionnellement avec scale (passer scaleFrom={0.7} pour effet "qui grandit").
 * Respecte prefers-reduced-motion (pas de translate ni scale, fade instantane).
 */
export default function Reveal({
  children,
  y = ANIMATION.translate.standard,
  duration = ANIMATION.duration.medium,
  delay = 0,
  ease = ANIMATION.ease.out,
  className,
  as: Tag = 'div',
  scaleFrom,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(
    () => {
      if (!ref.current) return;

      if (prefersReduced) {
        gsap.set(ref.current, { opacity: 1, y: 0, scale: 1 });
        return;
      }

      const fromVars: gsap.TweenVars = { opacity: 0, y };
      if (scaleFrom !== undefined) fromVars.scale = scaleFrom;

      const toVars: gsap.TweenVars = {
        opacity: 1,
        y: 0,
        duration,
        delay,
        ease,
        scrollTrigger: {
          trigger: ref.current,
          start: ANIMATION.trigger.start,
          once: ANIMATION.trigger.once,
        },
      };
      if (scaleFrom !== undefined) toVars.scale = 1;

      gsap.fromTo(ref.current, fromVars, toVars);
    },
    { dependencies: [prefersReduced, scaleFrom] },
  );

  return (
    <Tag ref={ref as never} className={className} style={{ willChange: 'transform, opacity' }}>
      {children}
    </Tag>
  );
}
