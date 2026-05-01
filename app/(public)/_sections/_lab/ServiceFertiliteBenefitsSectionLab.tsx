'use client';

import Reveal from '../../_components/animations/Reveal';
import StaggerChildren from '../../_components/animations/StaggerChildren';
import HoverLift from '../../_components/animations/HoverLift';
import SectionNumber from '../../_components/SectionNumber';
import SectionHeading from '../../_components/SectionHeading';

const BENEFITS = [
  "Régulariser un cycle menstruel irrégulier",
  "Améliorer la circulation sanguine vers l'utérus",
  "Soutenir la qualité de l'endomètre",
  "Atténuer le stress et l'anxiété",
  "Mieux tolérer les traitements hormonaux (FIV, IIU)",
  "Accompagner le SOPK ou l'endométriose",
];

export default function ServiceFertiliteBenefitsSectionLab() {
  return (
    <section className="bg-public-beige-warm py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[960px] mx-auto">
        <SectionNumber number="02" align="left" />
        <Reveal>
          <SectionHeading kicker="CE QUE L'ACUPUNCTURE FAIT" title="Un soutien concret, pas des promesses." align="left" />
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-6 mb-10 text-[17px] leading-relaxed text-public-text-medium max-w-[720px]">
            L&rsquo;acupuncture peut offrir plusieurs b&eacute;n&eacute;fices mesurables &mdash; physiologiques et &eacute;motionnels.
          </p>
        </Reveal>
        <StaggerChildren scale={0.96} y={20} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BENEFITS.map((benefit) => (
            <HoverLift key={benefit}>
              <div className="bg-white/70 backdrop-blur-sm rounded-[12px] p-5 border border-public-border-subtle flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-public-accent-warm shrink-0 mt-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                <span className="text-[15px] text-public-text-medium leading-relaxed">{benefit}</span>
              </div>
            </HoverLift>
          ))}
        </StaggerChildren>
        <div className="mt-10">
          <a href="/ressources/acupuncture-fertilite-montreal" className="arrow-link text-[14px] font-medium text-public-accent-warm underline underline-offset-4">
            Explorez les &eacute;tudes scientifiques &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
