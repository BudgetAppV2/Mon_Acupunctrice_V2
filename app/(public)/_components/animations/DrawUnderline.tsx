'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';

interface DrawUnderlineProps {
  children: ReactNode;
  color?: string;
  thickness?: number;
  delay?: number;
  duration?: number;
}

export default function DrawUnderline({
  children,
  color = '#B8694A',
  thickness = 2,
  delay = 0.4,
  duration = 0.8,
}: DrawUnderlineProps) {
  const lineRef = useRef<HTMLSpanElement>(null);
  const prefersReduced = useReducedMotion();

  useGSAP(() => {
    if (!lineRef.current) return;
    if (prefersReduced) { gsap.set(lineRef.current, { scaleX: 1 }); return; }
    gsap.fromTo(lineRef.current, { scaleX: 0 }, { scaleX: 1, duration, delay, ease: 'power2.inOut' });
  }, { dependencies: [prefersReduced] });

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
      <span
        ref={lineRef}
        aria-hidden="true"
        style={{
          position: 'absolute', left: 0, right: 0, bottom: '0.05em',
          height: thickness, backgroundColor: color, transformOrigin: 'left center', willChange: 'transform',
        }}
      />
    </span>
  );
}
