'use client';

import HeroEntrance from '../../_components/animations/HeroEntrance';
import DrawUnderline from '../../_components/animations/DrawUnderline';
import CtaButton from '../../_components/CtaButton';

export default function ServiceFertiliteHeroSectionLab() {
  return (
    <section className="bg-gradient-to-b from-public-beige-bg to-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-12 md:gap-[72px] items-center">
        <div>
          <HeroEntrance fromOpacity={0} fromScale={1} delay={0}>
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[2.5px] text-public-accent-taupe-dark mb-4">
              FERTILIT&Eacute; &middot; ROSEMONT &amp; REPENTIGNY
            </span>
          </HeroEntrance>
          <HeroEntrance fromOpacity={0} fromScale={1} delay={0.15}>
            <h1 className="font-public-serif text-[40px] md:text-[56px] font-medium leading-[1.1] tracking-tight text-public-text-dark mb-6">
              Votre parcours fertilit&eacute;,{' '}
              <DrawUnderline delay={0.6} duration={0.8}>
                <em className="italic">accompagn&eacute;</em>
              </DrawUnderline>
              .
            </h1>
          </HeroEntrance>
          <HeroEntrance fromOpacity={0} fromScale={1} delay={0.3}>
            <p className="text-[18px] leading-relaxed text-public-text-medium mb-8">
              Que &ccedil;a fasse six mois, deux ans, ou que vous soyez en protocole de FIV
              &mdash; le parcours de fertilit&eacute; demande beaucoup plus d&rsquo;&eacute;nergie
              &eacute;motionnelle qu&rsquo;on ne l&rsquo;imagine.
            </p>
          </HeroEntrance>
          <HeroEntrance fromOpacity={0} fromScale={1} delay={0.45}>
            <div className="flex flex-wrap gap-4">
              <CtaButton variant="primary" size="lg" href="/reserver">Prendre rendez-vous</CtaButton>
              <CtaButton variant="secondary" href="/ressources/acupuncture-fertilite-montreal">Lire le guide complet</CtaButton>
            </div>
          </HeroEntrance>
        </div>
        <HeroEntrance fromOpacity={0.6} fromScale={1.02} duration={1.2} className="max-w-[420px] mx-auto md:max-w-none">
          <picture>
            <source srcSet="/site/judith/judith-portrait-07.avif" type="image/avif" />
            <source srcSet="/site/judith/judith-portrait-07.webp" type="image/webp" />
            <img src="/site/judith/judith-portrait-07.webp" alt="Judith" width={1600} height={2400} loading="lazy" className="w-full aspect-[4/5] object-cover rounded-[20px] shadow-public-photo" />
          </picture>
        </HeroEntrance>
      </div>
    </section>
  );
}
