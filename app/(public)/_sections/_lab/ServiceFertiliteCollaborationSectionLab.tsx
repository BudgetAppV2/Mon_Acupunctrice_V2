'use client';

import Reveal from '../../_components/animations/Reveal';
import SectionHeading from '../../_components/SectionHeading';

export default function ServiceFertiliteCollaborationSectionLab() {
  return (
    <section className="bg-public-beige-bg py-[68px] md:py-[104px] px-5 md:px-8 border-t border-b border-public-accent-warm/20">
      <div className="max-w-[780px] mx-auto">
        <Reveal>
          <SectionHeading kicker="COMPL&Eacute;MENT, JAMAIS OPPOSITION" title="J&rsquo;accompagne votre suivi m&eacute;dical." align="left" />
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-8 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
            <p>Mon r&ocirc;le est compl&eacute;mentaire &agrave; votre suivi m&eacute;dical, jamais en opposition.</p>
            <p>Si vous avez des r&eacute;sultats d&rsquo;examens, apportez-les. On pourra en discuter ensemble.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
