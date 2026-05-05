'use client';

import Reveal from '../_components/animations/Reveal';
import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';

export default function ServiceFertiliteCollaborationSection() {
  return (
    <section className="bg-public-beige-bg py-[68px] md:py-[104px] px-5 md:px-8 border-t border-b border-public-accent-warm/20">
      <div className="max-w-[780px] mx-auto">
        <Reveal scaleFrom={0.7} delay={0.1} duration={0.8}>
          <SectionNumber number="03" align="left" />
        </Reveal>
        <Reveal>
          <SectionHeading kicker="COMPL&Eacute;MENT, JAMAIS OPPOSITION" title="L&rsquo;acupuncture augmente-t-elle les chances de succ&egrave;s en FIV ?" align="left" />
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-8 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
            <p>
              J&rsquo;accompagne r&eacute;guli&egrave;rement des femmes suivies dans les cliniques
              de fertilit&eacute; de Montr&eacute;al. Mon r&ocirc;le est compl&eacute;mentaire &agrave;
              votre suivi m&eacute;dical, jamais en opposition.
            </p>
            <p>
              Si vous avez des r&eacute;sultats d&rsquo;examens (bilan hormonal, hyst&eacute;rosalpingographie,
              bilan de fertilit&eacute;), apportez-les. On pourra en discuter ensemble.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
