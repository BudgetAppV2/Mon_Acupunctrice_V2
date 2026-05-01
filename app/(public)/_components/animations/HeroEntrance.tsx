'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

interface HeroEntranceProps {
  children: ReactNode;
  className?: string;
  fromOpacity?: number;
  fromScale?: number;
  duration?: number;
  delay?: number;
}

export default function HeroEntrance({
  children, className, fromOpacity = 0, fromScale = 1.02, duration = 1.2, delay = 0,
}: HeroEntranceProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(() => {
    if (!ref.current) return;
    if (prefersReduced) { gsap.set(ref.current, { opacity: 1, scale: 1 }); return; }
    gsap.fromTo(ref.current, { opacity: fromOpacity, scale: fromScale }, { opacity: 1, scale: 1, duration, delay, ease: 'power3.out' });
  }, { dependencies: [prefersReduced, fromOpacity, fromScale] });

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform, opacity' }}>
      {children}
    </div>
  );
}
