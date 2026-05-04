'use client';

import Image from 'next/image';
import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';
import CtaButton from '../_components/CtaButton';
import Reveal from '../_components/animations/Reveal';

export default function AboutSection() {
  return (
    <section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-12 items-center relative">
        <div className="max-w-[340px] mx-auto md:max-w-none">
          <Image
            src="/site/judith/judith-portrait-08.webp"
            alt="Judith Dufour-Savard"
            width={1600}
            height={1067}
            loading="lazy"
            sizes="(max-width: 768px) 340px, (max-width: 1280px) 40vw, 460px"
            className="w-full h-auto rounded-[14px] shadow-public-photo aspect-[3/4] object-cover object-[center_20%]"
          />
        </div>

        <div>
          <Reveal scaleFrom={0.7} delay={0.1} duration={0.8}>
            <SectionNumber number="04" align="left" />
          </Reveal>
          <Reveal>
            <SectionHeading kicker="QUI JE SUIS" title="Je suis Judith." align="left" />
          </Reveal>

          <Reveal delay={0.15}>
          <div className="mt-6 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
            <p>
              Avant de devenir acupunctrice,{' '}
              <strong className="text-public-text-dark">j&rsquo;ai travaill&eacute; en maison de naissance</strong>.
              C&rsquo;est l&agrave; que j&rsquo;ai d&eacute;couvert &agrave; quel point le corps des femmes est capable
              de choses extraordinaires &mdash; quand il est bien accompagn&eacute;.
              Je suis aussi <strong className="text-public-text-dark">m&egrave;re de trois enfants</strong>.
            </p>
            <p>
              Ma pratique, c&rsquo;est un m&eacute;lange de ce que j&rsquo;ai appris dans ma formation,
              de ce que j&rsquo;ai v&eacute;cu comme femme et comme m&egrave;re, et de l&rsquo;attention profonde
              que je porte &agrave; chaque personne qui me fait confiance.
            </p>
          </div>
          </Reveal>

          <Reveal delay={0.4}>
          <div className="flex flex-wrap gap-3 my-7">
            <Badge icon={<ShieldIcon />} label="Membre OAQ" />
            <Badge icon={<BuildingIcon />} label="La Source en Soi" />
            <Badge icon={<HeartIcon />} label="M&egrave;re de 3 enfants" />
          </div>

          <CtaButton variant="primary" size="lg" href="/a-propos">
            Lire mon parcours complet
          </CtaButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-public-beige-light px-3 py-1.5 text-[13px] font-medium text-public-text-medium">
      {icon}
      {label}
    </span>
  );
}

function ShieldIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-public-accent-taupe"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>;
}

function BuildingIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-public-accent-taupe"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0v.008" /></svg>;
}

function HeartIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-public-accent-taupe"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>;
}
