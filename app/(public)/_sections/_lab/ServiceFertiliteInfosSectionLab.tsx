'use client';

import Reveal from '../../_components/animations/Reveal';
import StaggerChildren from '../../_components/animations/StaggerChildren';
import HoverLift from '../../_components/animations/HoverLift';
import CountUp from '../../_components/animations/CountUp';
import SectionHeading from '../../_components/SectionHeading';

export default function ServiceFertiliteInfosSectionLab() {
  return (
    <section className="bg-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[960px] mx-auto">
        <Reveal>
          <SectionHeading kicker="PRATIQUE" title="Ce qu'il faut savoir." />
        </Reveal>
        <StaggerChildren scale={0.92} y={28} stagger={0.12} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <HoverLift>
            <div className="bg-white rounded-[14px] p-8 border border-public-border-subtle text-center">
              <h3 className="font-public-serif text-[20px] font-semibold mb-2 text-public-text-dark">Dur&eacute;e</h3>
              <p className="text-[14px] text-public-text-medium">
                <span className="font-public-serif text-[28px] font-medium text-public-accent-warm">
                  <CountUp to={60} duration={1.4} />
                </span>
                <span className="block mt-1">minutes par s&eacute;ance.</span>
              </p>
            </div>
          </HoverLift>
          <HoverLift>
            <div className="bg-white rounded-[14px] p-8 border border-public-border-subtle text-center">
              <h3 className="font-public-serif text-[20px] font-semibold mb-2 text-public-text-dark">Tarifs</h3>
              <p className="text-[14px] text-public-text-medium">
                <span className="font-public-serif text-[28px] font-medium text-public-accent-warm">
                  <CountUp to={100} duration={1.6} suffix=" $" />
                </span>
                <span className="block mt-1">la s&eacute;ance.</span>
              </p>
            </div>
          </HoverLift>
          <HoverLift>
            <div className="bg-white rounded-[14px] p-8 border border-public-border-subtle text-center">
              <h3 className="font-public-serif text-[20px] font-semibold mb-2 text-public-text-dark">Avis Google</h3>
              <p className="text-[14px] text-public-text-medium">
                <span className="font-public-serif text-[28px] font-medium text-public-accent-warm">
                  <CountUp to={4.9} duration={1.4} decimals={1} suffix="/5" />
                </span>
                <span className="block mt-1">sur 1 215 avis La Source en Soi.</span>
              </p>
            </div>
          </HoverLift>
        </StaggerChildren>
      </div>
    </section>
  );
}
