'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import { ANIMATION } from '@/lib/animations/constants';

interface RevealWordsProps {
  /** Texte a animer (string seulement, pas de React children — pour split par mots). */
  text: string;
  /** Decalage entre mots en s (default: 0.06) */
  stagger?: number;
  /** Duree par mot en s (default: 0.8) */
  duration?: number;
  /** Delai initial en s (default: 0) */
  delay?: number;
  /** Distance Y en px (default: 24) */
  y?: number;
  /** Si true, demarre au mount (pas scroll-trigger). Pour les hero. */
  atMount?: boolean;
  className?: string;
}

/**
 * Reveal par mots : split le texte sur les espaces et anime chaque mot
 * avec un decalage. Effet editorial premium (Aesop, Apple Health Stories).
 *
 * Mode `atMount={true}` = anime au montage (hero), sinon scroll-triggered.
 *
 * Usage :
 *   <RevealWords text="Votre grossesse, accompagnee en douceur." atMount />
 */
export default function RevealWords({
  text,
  stagger = 0.06,
  duration = 0.8,
  delay = 0,
  y = 24,
  atMount = false,
  className,
}: RevealWordsProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReduced = useReducedMotion();

  // Split par mots tout en preservant les espaces et la ponctuation
  const words = text.split(/(\s+)/); // garde les espaces dans le tableau

  useGSAP(
    () => {
      if (!ref.current) return;
      const wordEls = ref.current.querySelectorAll('[data-word]');
      if (!wordEls.length) return;

      if (prefersReduced) {
        gsap.set(wordEls, { opacity: 1, y: 0 });
        return;
      }

      const fromVars: gsap.TweenVars = { opacity: 0, y };
      const toVars: gsap.TweenVars = {
        opacity: 1,
        y: 0,
        duration,
        delay,
        stagger,
        ease: ANIMATION.ease.smoothOut,
      };

      if (!atMount) {
        toVars.scrollTrigger = {
          trigger: ref.current,
          start: ANIMATION.trigger.start,
          once: ANIMATION.trigger.once,
        };
      }

      gsap.fromTo(wordEls, fromVars, toVars);
    },
    { dependencies: [prefersReduced, atMount] },
  );

  return (
    <span ref={ref} className={className}>
      {words.map((w, i) => {
        if (/^\s+$/.test(w)) {
          // Espace : on le rend tel quel pour preserver le layout
          return <span key={i}>{w}</span>;
        }
        return (
          <span
            key={i}
            data-word
            style={{ display: 'inline-block', willChange: 'transform, opacity' }}
          >
            {w}
          </span>
        );
      })}
    </span>
  );
}
