'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

interface CountUpProps {
  /** Valeur cible */
  to: number;
  /** Valeur de depart (default: 0) */
  from?: number;
  /** Duree en s (default: 1.6) */
  duration?: number;
  /** Nombre de decimales (default: 0) */
  decimals?: number;
  /** Suffixe (ex: " $", " min", "%") */
  suffix?: string;
  /** Prefixe (ex: "~") */
  prefix?: string;
  className?: string;
}

/**
 * Compteur anime qui s'incremente quand l'element entre en viewport.
 * Respecte prefers-reduced-motion (affiche directement la valeur finale).
 *
 * Usage :
 *   <CountUp to={60} suffix=" min" />
 *   <CountUp to={100} suffix=" $" />
 *   <CountUp to={4.9} decimals={1} suffix="/5" />
 */
export default function CountUp({
  to,
  from = 0,
  duration = 1.6,
  decimals = 0,
  suffix = '',
  prefix = '',
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(
    () => {
      if (!ref.current) return;

      if (prefersReduced) {
        ref.current.textContent = `${prefix}${to.toFixed(decimals)}${suffix}`;
        return;
      }

      // Etat initial : valeur de depart visible
      ref.current.textContent = `${prefix}${from.toFixed(decimals)}${suffix}`;

      // Object intermediaire pour animer la valeur
      const counter = { value: from };

      gsap.to(counter, {
        value: to,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = `${prefix}${counter.value.toFixed(decimals)}${suffix}`;
          }
        },
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          once: true,
        },
      });
    },
    { dependencies: [prefersReduced, to, from] },
  );

  return <span ref={ref} className={className}>{prefix}{from.toFixed(decimals)}{suffix}</span>;
}
