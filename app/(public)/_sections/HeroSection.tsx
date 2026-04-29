import GrainOverlay from '../_components/GrainOverlay';
import WatermarkText from '../_components/WatermarkText';
import CtaButton from '../_components/CtaButton';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-b from-public-beige-bg to-public-beige-light overflow-hidden">
      <GrainOverlay className="py-12 md:py-[88px] px-5 md:px-8">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-12 md:gap-[72px] items-center relative">
          {/* SVG decoratif femme enceinte — derriere le contenu, gauche, line-art en filigrane (plus grand pour matcher v4) */}
          <div
            className="absolute left-[-80px] bottom-[-120px] w-[680px] h-[820px] pointer-events-none z-0 hidden md:block"
            aria-hidden="true"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/site/svg/pregnant-woman.svg"
              alt=""
              loading="lazy"
              className="w-full h-full object-contain"
              style={{ opacity: 0.20, mixBlendMode: 'multiply' }}
            />
          </div>

          {/* Contenu gauche */}
          <div className="relative z-10">
            <span className="inline-block rounded-full bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[1.5px] text-public-accent-taupe-dark mb-6 shadow-public-sm">
              Acupunctrice &middot; Membre OAQ &middot; Rosemont
            </span>

            <h1 className="font-public-serif text-[48px] md:text-[74px] font-medium leading-[1.05] tracking-tight text-public-text-dark mb-6">
              Venez comme vous{' '}
              <em className="italic underline decoration-public-accent-warm decoration-2 underline-offset-8">
                &ecirc;tes
              </em>
              .
            </h1>

            <p className="text-[18px] leading-relaxed text-public-text-medium max-w-[520px] mb-8">
              Acupunctrice &agrave; Rosemont et &agrave; Repentigny, j&rsquo;accompagne les femmes et les familles
              dans leur parcours de fertilit&eacute;, de grossesse, et au-del&agrave;.
              Avec douceur, &eacute;coute et l&rsquo;envie sinc&egrave;re de vous aider.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <CtaButton variant="primary" size="lg" href="/reserver">
                Prendre rendez-vous
              </CtaButton>
              <CtaButton variant="secondary" href="/a-propos">
                D&eacute;couvrir mon parcours
              </CtaButton>
            </div>

            <div className="flex flex-col gap-3 text-[15px] text-public-text-medium">
              <span className="flex items-center gap-2.5">
                <HeartIcon />
                M&egrave;re de 3 enfants
              </span>
              <span className="flex items-center gap-2.5">
                <ShieldIcon />
                Ex-maison de naissance
              </span>
              <span className="flex items-center gap-2.5">
                <MapPinIcon />
                2554 Beaubien Est
              </span>
            </div>
          </div>

          {/* Photo hero — Option B LCP */}
          <div className="max-w-[420px] md:max-w-none mx-auto md:mx-0">
            <picture>
              <source srcSet="/site/judith/judith-portrait-01.avif" type="image/avif" />
              <source srcSet="/site/judith/judith-portrait-01.webp" type="image/webp" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/site/judith/judith-portrait-01.webp"
                alt="Judith Dufour Savard, acupunctrice, dans son cabinet a La Source en Soi a Rosemont"
                width={1600}
                height={2400}
                fetchPriority="high"
                className="w-full aspect-[4/5] object-cover object-[center_15%] rounded-[20px] shadow-public-photo"
              />
            </picture>
          </div>
        </div>

        <WatermarkText text="Soin" className="bottom-8 right-8" opacity={0.05} />
      </GrainOverlay>
    </section>
  );
}

function HeartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-public-accent-warm shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-public-accent-warm shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-public-accent-warm shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}
