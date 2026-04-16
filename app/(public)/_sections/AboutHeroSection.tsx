import GrainOverlay from '../_components/GrainOverlay';
import SectionHeading from '../_components/SectionHeading';

export default function AboutHeroSection() {
  return (
    <GrainOverlay className="bg-gradient-to-b from-public-beige-bg to-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-12 md:gap-[72px] items-center">
        <div className="max-w-[340px] mx-auto md:max-w-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/site/judith/judith-portrait-08.webp"
            alt="Portrait de Judith Dufour Savard, acupunctrice"
            width={1600}
            height={1067}
            loading="eager"
            className="w-full rounded-[14px] shadow-public-photo aspect-[3/4] object-cover object-[center_20%]"
          />
        </div>

        <div>
          <SectionHeading kicker="QUI JE SUIS" title="Je suis Judith." align="left" />
          <div className="mt-6 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
            <p>
              Acupunctrice &agrave; Rosemont, j&rsquo;accompagne les femmes, les familles et les enfants
              dans les grands passages de la vie. Fertilit&eacute;, grossesse, post-partum, p&eacute;diatrie
              &mdash; et aussi, tout simplement, les maux du quotidien.
            </p>
            <p>
              Mon cabinet est &agrave; La Source en Soi, sur Beaubien Est. C&rsquo;est un lieu chaleureux,
              familial, o&ugrave; chaque personne est accueillie dans ce qu&rsquo;elle vit, maintenant.
            </p>
          </div>
        </div>
      </div>
    </GrainOverlay>
  );
}
