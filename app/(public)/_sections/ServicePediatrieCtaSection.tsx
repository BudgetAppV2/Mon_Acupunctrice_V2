'use client';

import Link from 'next/link';
import Reveal from '../_components/animations/Reveal';
import MagneticButton from '../_components/animations/MagneticButton';
import FloatingDeco from '../_components/animations/FloatingDeco';
import CtaButton from '../_components/CtaButton';

export default function ServicePediatrieCtaSection() {
  return (
    <section className="cta-bg-shift text-white py-[68px] md:py-[88px] px-5 md:px-8 text-center relative overflow-hidden">
      <FloatingDeco amplitude={12} duration={6} delay={0} className="absolute top-[20px] left-[-80px] w-[30%] h-full pointer-events-none z-0 hidden md:block overflow-hidden">
        <div aria-hidden="true" className="w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/site/svg/plant.webp" alt="" loading="lazy" className="w-full h-full object-cover object-center" style={{ mixBlendMode: 'screen', transform: 'scale(2.2)', transformOrigin: 'center center', opacity: 0.55 }} />
        </div>
      </FloatingDeco>
      <FloatingDeco amplitude={10} duration={7} delay={2} className="absolute top-[20px] right-[-80px] w-[30%] h-full pointer-events-none z-0 hidden md:block overflow-hidden">
        <div aria-hidden="true" className="w-full h-full" style={{ transform: 'scaleX(-1)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/site/svg/plant.webp" alt="" loading="lazy" className="w-full h-full object-cover object-center" style={{ mixBlendMode: 'screen', transform: 'scale(2.2)', transformOrigin: 'center center', opacity: 0.55 }} />
        </div>
      </FloatingDeco>

      <Reveal y={56} duration={1.1} delay={0.2} className="max-w-[620px] mx-auto relative z-10">
        <h2 className="font-public-serif text-[32px] md:text-[44px] font-medium leading-[1.15] mb-4">
          Envie d&rsquo;en parler ?
        </h2>
        <p className="text-[16px] italic opacity-90 mb-8 font-public-serif">
          Si votre b&eacute;b&eacute; pleure sans arr&ecirc;t ou si votre enfant traverse une p&eacute;riode difficile, on peut en parler. La premi&egrave;re rencontre est toujours un &eacute;change doux et sans pression.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
          <MagneticButton range={120} strength={0.4}>
            <div className="shimmer-cta rounded-md">
              <CtaButton variant="white" size="lg" href="/reserver">Prendre rendez-vous en ligne</CtaButton>
            </div>
          </MagneticButton>
          <CtaButton variant="secondary" href="/contact" className="text-white/80 hover:text-white">
            Ou &eacute;crivez-moi
          </CtaButton>
        </div>
        <p className="mt-4 text-[13px] text-white/60">
          Disponible &agrave; Rosemont (La Source en Soi) et &agrave; Repentigny (&Eacute;den Yoga Pilates).
        </p>
        <div className="mt-4 text-center">
          <Link href="/faq" className="text-[14px] text-white/70 underline underline-offset-4 hover:text-white transition-colors">
            Consulter les questions fr&eacute;quentes
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
