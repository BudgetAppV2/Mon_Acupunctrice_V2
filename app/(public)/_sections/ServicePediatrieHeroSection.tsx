import GrainOverlay from '../_components/GrainOverlay';
import CtaButton from '../_components/CtaButton';

export default function ServicePediatrieHeroSection() {
  return (
    <GrainOverlay className="bg-gradient-to-b from-public-beige-bg to-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-12 md:gap-[72px] items-center">
        {/* Contenu gauche */}
        <div>
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[2.5px] text-public-accent-taupe-dark mb-4">
            P&Eacute;DIATRIE &middot; ROSEMONT &amp; REPENTIGNY
          </span>
          <h1 className="font-public-serif text-[40px] md:text-[56px] font-medium leading-[1.1] tracking-tight text-public-text-dark mb-6">
            Des soins{' '}
            <em className="italic underline decoration-public-accent-warm decoration-2 underline-offset-8">
              doux
            </em>
            , pour les plus petits.
          </h1>
          <p className="text-[18px] leading-relaxed text-public-text-medium mb-8">
            Coliques qui &eacute;puisent, sommeil qui dispara&icirc;t, allergies saisonni&egrave;res,
            anxi&eacute;t&eacute; &agrave; l&rsquo;&eacute;cole. L&rsquo;acupuncture p&eacute;diatrique est
            beaucoup plus douce que ce qu&rsquo;on imagine &mdash; souvent sans aiguilles pour les
            b&eacute;b&eacute;s. Et elle est &eacute;tudi&eacute;e scientifiquement depuis plus de 10 ans.
          </p>
          <div className="flex flex-wrap gap-4">
            <CtaButton variant="primary" size="lg" href="/reserver">
              Prendre rendez-vous
            </CtaButton>
            <CtaButton variant="secondary" href="/ressources/acupuncture-pediatrique-enfants-bebes">
              Lire le guide complet
            </CtaButton>
          </div>
        </div>

        {/* Photo hero : portrait-02 (proche/douce) */}
        <div className="max-w-[420px] mx-auto md:max-w-none">
          <picture>
            <source srcSet="/site/judith/judith-portrait-02.avif" type="image/avif" />
            <source srcSet="/site/judith/judith-portrait-02.webp" type="image/webp" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/site/judith/judith-portrait-02.webp"
              alt="Judith dans une posture proche et douce, evoquant une approche rassurante pour les enfants"
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
