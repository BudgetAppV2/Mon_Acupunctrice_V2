'use client';

import Reveal from '../../_components/animations/Reveal';
import StaggerChildren from '../../_components/animations/StaggerChildren';
import SectionHeading from '../../_components/SectionHeading';

export default function ServiceFertiliteHommeSectionLab() {
  return (
    <section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[780px] mx-auto">
        <Reveal>
          <SectionHeading kicker="FERTILIT&Eacute; MASCULINE" title="Votre conjoint est aussi le bienvenu." align="left" />
        </Reveal>
        <StaggerChildren stagger={0.1} className="mt-8 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
          <p>Chez l&rsquo;homme, l&rsquo;acupuncture peut am&eacute;liorer la qualit&eacute;, la quantit&eacute; et la motilit&eacute; des spermatozo&iuml;des.</p>
          <p>Certaines recherches sugg&egrave;rent que l&rsquo;acupuncture pourrait aider &agrave; r&eacute;guler les hormones.</p>
          <p>Par ailleurs, l&rsquo;acupuncture peut activer le syst&egrave;me parasympathique et favoriser une sensation de relaxation.</p>
        </StaggerChildren>
      </div>
    </section>
  );
}
