'use client';

import Link from 'next/link';
import Reveal from '../_components/animations/Reveal';
import StaggerChildren from '../_components/animations/StaggerChildren';
import HoverLift from '../_components/animations/HoverLift';
import CountUp from '../_components/animations/CountUp';
import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';

export default function ServiceFertiliteInfosSection() {
  return (
    <section className="bg-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[960px] mx-auto">
        <Reveal scaleFrom={0.7} delay={0.1} duration={0.8}>
          <SectionNumber number="04" />
        </Reveal>
        <Reveal>
          <SectionHeading kicker="PRATIQUE" title="Ce qu'il faut savoir." />
        </Reveal>

        <StaggerChildren scale={0.92} y={28} stagger={0.12} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <HoverLift>
            <div className="bg-white rounded-[14px] p-8 border border-public-border-subtle text-center">
              <div className="flex justify-center mb-4"><ClockIcon /></div>
              <h3 className="font-public-serif text-[20px] font-semibold mb-2 text-public-text-dark">Dur&eacute;e</h3>
              <p className="text-[14px] text-public-text-medium">
                <span className="font-public-serif text-[28px] font-medium text-public-accent-warm"><CountUp to={60} duration={1.4} /></span>
                <span className="block mt-1">minutes par s&eacute;ance.</span>
              </p>
            </div>
          </HoverLift>
          <HoverLift>
            <div className="bg-white rounded-[14px] p-8 border border-public-border-subtle text-center">
              <div className="flex justify-center mb-4"><DollarIcon /></div>
              <h3 className="font-public-serif text-[20px] font-semibold mb-2 text-public-text-dark">Tarifs</h3>
              <p className="text-[14px] text-public-text-medium">
                <span className="font-public-serif text-[28px] font-medium text-public-accent-warm"><CountUp to={100} duration={1.6} suffix=" $" /></span>
                <span className="block mt-1">la s&eacute;ance d&rsquo;une heure.</span>
              </p>
            </div>
          </HoverLift>
          <HoverLift>
            <div className="bg-white rounded-[14px] p-8 border border-public-border-subtle text-center">
              <div className="flex justify-center mb-4"><ReceiptIcon /></div>
              <h3 className="font-public-serif text-[20px] font-semibold mb-2 text-public-text-dark">Assurances</h3>
              <p className="text-[14px] text-public-text-medium leading-relaxed">La plupart des assurances priv&eacute;es couvrent l&rsquo;acupuncture. Re&ccedil;u officiel &eacute;mis.</p>
            </div>
          </HoverLift>
        </StaggerChildren>

        <Reveal delay={0.3}>
          <p className="mt-12 text-center text-[15px] text-public-text-medium max-w-[720px] mx-auto">
            Pour les personnes avec des contraintes financi&egrave;res, j&rsquo;offre aussi des s&eacute;ances en{' '}
            <Link href="/services/acupuncture-sociale" className="text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors">
              acupuncture sociale &agrave; tarif r&eacute;duit
            </Link>.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function ClockIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-public-accent-warm"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
}
function DollarIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-public-accent-warm"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-2.21 0-4-1.5-4-3.5S9.79 5 12 5c1.146 0 2.18.4 2.913 1.04m-5.913 8.96c.348.262.778.477 1.252.624.474.146.988.226 1.516.226.528 0 1.042-.08 1.516-.226.474-.147.904-.362 1.252-.624" /></svg>;
}
function ReceiptIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-public-accent-warm"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" /></svg>;
}
