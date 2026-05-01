'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

interface ScrollHighlightTextProps {
  /** Texte a animer (string seulement, sera split par mots) */
  text: string;
  className?: string;
  /** Couleur de depart (gris pale) */
  fromColor?: string;
  /** Couleur d'arrivee (sombre) */
  toColor?: string;
  /** Position scrollTrigger start (default: 'top 70%') */
  start?: string;
  /** Position scrollTrigger end (default: 'bottom 40%') */
  end?: string;
}

/**
 * ScrollHighlightText — texte qui s'assombrit mot par mot au scroll.
 *
 * Effet editorial inspire d'Apple Health Stories et NYT : le texte commence
 * en gris pale et chaque mot devient sombre l'un apres l'autre au fur
 * et a mesure que l'utilisateur scrolle dans la section.
 *
 * Donne une sensation de "lecture qui se construit" — le visiteur sent qu'il
 * lit le texte alors meme que le mouvement du scroll est ce qui le revele.
 *
 * Reduced-motion : tout le texte affiche directement en couleur finale.
 */
export default function ScrollHighlightText({
  text,
  className,
  fromColor = '#d4cfc4',
  toColor = '#3c3228',
  start = 'top 70%',
  end = 'bottom 40%',
}: ScrollHighlightTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const prefersReduced = useReducedMotion();

  // Split par mots tout en preservant les espaces
  const words = text.split(/(\s+)/);

  useGSAP(
    () => {
      if (!ref.current) return;
      const wordEls = ref.current.querySelectorAll('[data-highlight-word]');
      if (!wordEls.length) return;

      if (prefersReduced) {
        gsap.set(wordEls, { color: toColor });
        return;
      }

      // Etat initial : tous les mots en couleur pale
      gsap.set(wordEls, { color: fromColor });

      // Timeline scroll-scrubed : chaque mot s'assombrit en sequence
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start,
          end,
          scrub: 0.5, // suit le scroll avec un leger lerp pour que ca soit fluide
        },
      });

      wordEls.forEach((wordEl, i) => {
        // Chaque mot occupe 0.5 unites, avec un offset de 0.3 entre eux
        // -> overlap subtil, mots qui s'assombrissent en cascade
        tl.to(wordEl, { color: toColor, duration: 0.5, ease: 'none' }, i * 0.3);
      });
    },
    { dependencies: [prefersReduced, fromColor, toColor] },
  );

  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => {
        if (/^\s+$/.test(w)) {
          return <span key={i}>{w}</span>;
        }
        return (
          <span
            key={i}
            data-highlight-word
            style={{ display: 'inline-block', willChange: 'color' }}
          >
            {w}
          </span>
        );
      })}
    </p>
  );
}
