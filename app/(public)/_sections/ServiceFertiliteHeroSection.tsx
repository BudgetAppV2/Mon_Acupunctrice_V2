import GrainOverlay from '../_components/GrainOverlay';
import CtaButton from '../_components/CtaButton';

export default function ServiceFertiliteHeroSection() {
  return (
    <GrainOverlay className="bg-gradient-to-b from-public-beige-bg to-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-12 md:gap-[72px] items-center">
        {/* Contenu gauche */}
        <div>
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[2.5px] text-public-accent-taupe-dark mb-4">
            FERTILIT&Eacute;
          </span>
          <h1 className="font-public-serif text-[40px] md:text-[56px] font-medium leading-[1.1] tracking-tight text-public-text-dark mb-6">
            Votre parcours fertilit&eacute;,{' '}
            <em className="italic underline decoration-public-accent-warm decoration-2 underline-offset-8">
              accompagn&eacute;
            </em>
            .
          </h1>
          <p className="text-[18px] leading-relaxed text-public-text-medium mb-8">
            Que &ccedil;a fasse six mois, deux ans, ou que vous soyez en protocole de FIV
            &mdash; le parcours de fertilit&eacute; demande beaucoup plus d&rsquo;&eacute;nergie
            &eacute;motionnelle qu&rsquo;on ne l&rsquo;imagine. Je suis l&agrave; pour vous
            accompagner avec douceur, rigueur, et une vraie &eacute;coute.
          </p>
          <div className="flex flex-wrap gap-4">
            <CtaButton variant="primary" size="lg" href="/reserver">
              Prendre rendez-vous
            </CtaButton>
            <CtaButton variant="secondary" href="/ressources/acupuncture-fertilite-montreal">
              Lire le guide complet
            </CtaButton>
          </div>
        </div>

        {/* Photo hero : portrait-07 — lazy obligatoire */}
        <div className="max-w-[420px] mx-auto md:max-w-none">
          <picture>
            <source srcSet="/site/judith/judith-portrait-07.avif" type="image/avif" />
            <source srcSet="/site/judith/judith-portrait-07.webp" type="image/webp" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/site/judith/judith-portrait-07.webp"
              alt="Pierre zen avec aiguilles d'acupuncture, evoquant l'equilibre du parcours de fertilite"
              width={1600}
              height={2400}
              loading="lazy"
              className="w-full aspect-[4/5] object-cover rounded-[20px] shadow-public-photo"
            />
          </picture>
        </div>
      </div>
    </GrainOverlay>
  );
}
