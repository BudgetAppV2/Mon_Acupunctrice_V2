'use client';

import Reveal from '../../_components/animations/Reveal';
import RevealWords from '../../_components/animations/RevealWords';
import SectionNumber from '../../_components/SectionNumber';
import SectionHeading from '../../_components/SectionHeading';

export default function ServiceFertiliteBioSectionLab() {
  return (
    <section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[780px] mx-auto">
        <Reveal scaleFrom={0.7} delay={0.1} duration={0.8}>
          <SectionNumber number="01" align="left" />
        </Reveal>

        <Reveal>
          <SectionHeading kicker="QUI VOUS ACCOMPAGNE" title="Une approche n&eacute;e du terrain." align="left" />
        </Reveal>

        {/* Paragraphes en RevealWords scroll-triggered : chaque mot apparait
            mot par mot quand la section entre en viewport. Effet editorial calme. */}
        <div className="mt-8 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
          <p>
            <RevealWords
              text="Je suis Judith Dufour-Savard, acupunctrice à La Source en Soi."
              stagger={0.05}
              duration={0.7}
              y={20}
            />
          </p>
          <p>
            <RevealWords
              text="Ma pratique combine la rigueur de la médecine traditionnelle chinoise, les études scientifiques récentes, et une bonne dose d'humanité."
              stagger={0.04}
              duration={0.6}
              y={20}
            />
          </p>
        </div>

        <Reveal delay={0.4}>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-public-beige-light px-5 py-2.5 text-[13px] font-medium text-public-text-medium border border-public-border-subtle">
            Membre de l&rsquo;Ordre des acupuncteurs du Qu&eacute;bec (OAQ)
          </div>
        </Reveal>
      </div>
    </section>
  );
}
