'use client';

import Reveal from '../../_components/animations/Reveal';
import CtaButton from '../../_components/CtaButton';
import CtaBotanicalDecoLab from '../../_components/_lab/CtaBotanicalDecoLab';

export default function ServiceFertiliteCtaSectionLab() {
  return (
    <section className="cta-bg-shift text-white py-[68px] md:py-[88px] px-5 md:px-8 text-center relative overflow-hidden">
      <CtaBotanicalDecoLab />
      <Reveal y={32} duration={0.8} delay={0.2} className="max-w-[620px] mx-auto relative z-10">
        <h2 className="font-public-serif text-[32px] md:text-[44px] font-medium leading-[1.15] mb-4">
          Pr&ecirc;te &agrave; commencer ?
        </h2>
        <p className="text-[16px] italic opacity-90 mb-8 font-public-serif">
          La premi&egrave;re s&eacute;ance est un vrai &eacute;change.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <div className="shimmer-cta rounded-md">
            <CtaButton variant="white" size="lg" href="/reserver">Prendre rendez-vous en ligne</CtaButton>
          </div>
          <CtaButton variant="secondary" href="/contact" className="text-white/80 hover:text-white">
            Ou &eacute;crivez-moi
          </CtaButton>
        </div>
      </Reveal>
    </section>
  );
}
