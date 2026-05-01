'use client';

import FloatingDeco from '../animations/FloatingDeco';

export default function CtaBotanicalDecoLab() {
  return (
    <>
      <FloatingDeco amplitude={6} duration={4} delay={0} className="absolute -top-16 -left-20 w-[280px] h-[280px] opacity-[0.12] pointer-events-none z-0">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path d="M100 20c20 40 60 60 80 80-20 20-40 60-80 80-20-40-60-60-80-80 20-20 40-60 80-80z" fill="currentColor" opacity="0.4" />
        </svg>
      </FloatingDeco>
      <FloatingDeco amplitude={8} duration={5} delay={1.5} className="absolute -bottom-12 -right-16 w-[220px] h-[220px] opacity-[0.10] pointer-events-none z-0">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full rotate-45">
          <path d="M100 20c20 40 60 60 80 80-20 20-40 60-80 80-20-40-60-60-80-80 20-20 40-60 80-80z" fill="currentColor" opacity="0.4" />
        </svg>
      </FloatingDeco>
    </>
  );
}
