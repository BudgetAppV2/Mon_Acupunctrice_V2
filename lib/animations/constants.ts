export const ANIMATION = {
  duration: {
    short: 0.4,
    medium: 0.6,
    long: 1.2,
    breathe: 4.0,
    bgShift: 12.0,
  },
  ease: {
    out: 'power2.out',
    smoothOut: 'power3.out',
    inOut: 'sine.inOut',
  },
  translate: {
    subtle: 8,
    standard: 16,
    pronounced: 32,
  },
  stagger: {
    fast: 0.05,
    standard: 0.08,
    slow: 0.1,
  },
  trigger: {
    start: 'top 85%',
    once: true,
  },
} as const;
