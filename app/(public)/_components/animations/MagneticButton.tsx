'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

interface MagneticButtonProps {
  children: ReactNode;
  /** Distance d'attraction en px (default: 80) */
  range?: number;
  /** Force de l'attraction (0-1, default: 0.3) — plus haut = plus magnetique */
  strength?: number;
  className?: string;
}

/**
 * MagneticButton — wrappe un element pour qu'il "attire" le curseur
 * quand celui-ci s'approche dans un certain rayon.
 *
 * Effet subtil de modernite. Discret, ne perturbe pas l'usage.
 * Idealement applique aux CTAs principaux.
 *
 * Reduced-motion : pas d'effet (l'element reste statique).
 *
 * Usage :
 *   <MagneticButton>
 *     <CtaButton href="/reserver">Prendre rendez-vous</CtaButton>
 *   </MagneticButton>
 */
export default function MagneticButton({
  children,
  range = 80,
  strength = 0.3,
  className,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(() => {
    if (!ref.current || prefersReduced) return;

    const el = ref.current;
    let rect = el.getBoundingClientRect();

    // Recalcule rect au resize/scroll pour rester precis
    const updateRect = () => {
      rect = el.getBoundingClientRect();
    };
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, { passive: true });

    const onMouseMove = (e: MouseEvent) => {
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < range) {
        // Plus on est pres, plus l'attraction est forte
        const attraction = (1 - distance / range) * strength;
        gsap.to(el, {
          x: dx * attraction,
          y: dy * attraction,
          duration: 0.4,
          ease: 'power2.out',
        });
      } else {
        // Hors zone : retour a la position initiale
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)',
        });
      }
    };

    const onMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)',
      });
    };

    document.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
      document.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
    };
  }, { dependencies: [prefersReduced, range, strength] });

  return (
    <div ref={ref} className={className} style={{ display: 'inline-block', willChange: 'transform' }}>
      {children}
    </div>
  );
}
