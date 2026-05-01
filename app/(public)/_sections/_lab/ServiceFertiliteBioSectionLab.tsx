'use client';

import Reveal from '../../_components/animations/Reveal';
import RevealFromLeft from '../../_components/animations/RevealFromLeft';
import SectionNumber from '../../_components/SectionNumber';
import SectionHeading from '../../_components/SectionHeading';

export default function ServiceFertiliteBioSectionLab() {
  return (
    <section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[780px] mx-auto">
        <RevealFromLeft delay={0.1}>
          <SectionNumber number="01" align="left" />
        </RevealFromLeft>
        <Reveal>
          <SectionHeading kicker="QUI VOUS ACCOMPAGNE" title="Une approche n&eacute;e du terrain." align="left" />
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-8 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
            <p>Je suis Judith Dufour-Savard, acupunctrice &agrave; La Source en Soi.</p>
            <p>Ma pratique combine la rigueur de la m&eacute;decine traditionnelle chinoise, les &eacute;tudes scientifiques r&eacute;centes, et une bonne dose d&rsquo;humanit&eacute;.</p>
          </div>
        </Reveal>
        <Reveal delay={0.4}>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-public-beige-light px-5 py-2.5 text-[13px] font-medium text-public-text-medium border border-public-border-subtle">
            Membre de l&rsquo;Ordre des acupuncteurs du Qu&eacute;bec (OAQ)
          </div>
        </Reveal>
      </div>
    </section>
  );
}
