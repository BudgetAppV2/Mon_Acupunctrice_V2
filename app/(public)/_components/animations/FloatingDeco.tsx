'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

interface FloatingDecoProps {
  children: ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
  delay?: number;
}

export default function FloatingDeco({ children, className, amplitude = 6, duration = 4, delay = 0 }: FloatingDecoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(() => {
    if (!ref.current || prefersReduced) return;
    gsap.to(ref.current, { y: amplitude, duration, delay, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }, { dependencies: [prefersReduced, amplitude, duration, delay] });

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}
