import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';

export default function ServiceFertiliteBioSection() {
  return (
    <section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8 relative overflow-hidden">
      {/* SVG decoratif reproductive-flowers en filigrane a droite */}
      <div
        className="absolute -right-[80px] top-[40px] w-[460px] h-[560px] hidden md:block pointer-events-none z-0"
        aria-hidden="true"
        style={{ transform: 'rotate(-8deg)', opacity: 0.14, mixBlendMode: 'multiply' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/site/svg/reproductive-flowers.svg"
          alt=""
          loading="lazy"
          className="w-full h-full object-contain"
        />
      </div>

      <div className="max-w-[780px] mx-auto relative z-10">
        <SectionNumber number="01" align="left" />
        <SectionHeading
          kicker="QUI VOUS ACCOMPAGNE"
          title="Une approche n&eacute;e du terrain."
          align="left"
        />

        <div className="mt-8 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
          <p>
            Je suis Judith Dufour-Savard, acupunctrice &agrave; La Source en Soi, sur Beaubien Est
            &agrave; Rosemont. J&rsquo;ai travaill&eacute; &agrave; la Maison de naissance C&ocirc;te-des-Neiges
            avant ma pratique, et je suis m&egrave;re de trois enfants. Quand je vous &eacute;coute me parler
            de votre parcours de fertilit&eacute;, je ne le fais pas juste comme professionnelle &mdash;
            je le fais aussi comme femme qui comprend l&rsquo;attente, l&rsquo;espoir, et la fatigue
            &eacute;motionnelle qui viennent avec.
          </p>
          <p>
            Ma pratique combine la rigueur de la m&eacute;decine traditionnelle chinoise, les &eacute;tudes
            scientifiques r&eacute;centes (une{' '}
            <a
              href="/ressources/acupuncture-fertilite-montreal"
              className="text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
            >
              m&eacute;ta-analyse de septembre 2025
            </a>{' '}
            montre des r&eacute;sultats encourageants sur 3 561 femmes), et une bonne dose d&rsquo;humanit&eacute;.
          </p>
        </div>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-public-beige-light px-5 py-2.5 text-[13px] font-medium text-public-text-medium border border-public-border-subtle">
          <ShieldCheckIcon />
          Membre de l&rsquo;Ordre des acupuncteurs du Qu&eacute;bec (OAQ)
        </div>
      </div>
    </section>
  );
}

function ShieldCheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-public-accent-taupe">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}
