'use client';

import FloatingDeco from '../animations/FloatingDeco';

/**
 * Version LAB : meme structure que CtaBotanicalDeco mais avec animations FloatingDeco.
 * Utilise les memes images plant.webp en mix-blend-mode screen.
 * Les deux feuilles flottent avec amplitudes et delais differents pour un effet naturel.
 */
export default function CtaBotanicalDecoLab() {
  return (
    <>
      {/* Gauche */}
      <FloatingDeco
        amplitude={12}
        duration={6}
        delay={0}
        className="absolute top-[20px] left-[-80px] w-[30%] h-full pointer-events-none z-0 hidden md:block overflow-hidden"
      >
        <div aria-hidden="true" className="w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/site/svg/plant.webp"
            alt=""
            loading="lazy"
            className="w-full h-full object-cover object-center"
            style={{ mixBlendMode: 'screen', transform: 'scale(2.2)', transformOrigin: 'center center', opacity: 0.55 }}
          />
        </div>
      </FloatingDeco>

      {/* Droite (miroir) */}
      <FloatingDeco
        amplitude={10}
        duration={7}
        delay={2}
        className="absolute top-[20px] right-[-80px] w-[30%] h-full pointer-events-none z-0 hidden md:block overflow-hidden"
      >
        <div aria-hidden="true" className="w-full h-full" style={{ transform: 'scaleX(-1)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/site/svg/plant.webp"
            alt=""
            loading="lazy"
            className="w-full h-full object-cover object-center"
            style={{ mixBlendMode: 'screen', transform: 'scale(2.2)', transformOrigin: 'center center', opacity: 0.55 }}
          />
        </div>
      </FloatingDeco>
    </>
  );
}
