import PaperTexture from '../_components/PaperTexture';
import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';
import PilierCard from '../_components/PilierCard';

export default function PiliersSection() {
  return (
    <PaperTexture variant="real" className="py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[1280px] mx-auto relative">
        {/* SVG yoga — filigrane decoratif gauche, plus gros + plus transparent + leger angle (matcher v4) */}
        <div
          className="absolute left-[-260px] top-[-60px] w-[560px] h-[760px] pointer-events-none z-0 hidden lg:block"
          aria-hidden="true"
          style={{ transform: 'rotate(-8deg)', transformOrigin: 'center center' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/site/svg/yoga3.svg"
            alt=""
            loading="lazy"
            className="w-full h-full object-contain"
            style={{ opacity: 0.18, mixBlendMode: 'multiply' }}
          />
        </div>

        <SectionNumber number="01" />
        <SectionHeading
          kicker="TROIS DOMAINES, UN M&Ecirc;ME SOIN"
          title="Ce pour quoi on me consulte le plus"
          subtitle="Chaque parcours est unique, mais il y a trois univers dans lesquels j'accompagne le plus souvent mes patientes."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-[72px]">
          <div className="md:translate-y-6">
            <PilierCard
              title="Fertilit&eacute;"
              description="Soutien en fertilit&eacute; naturelle, FIV, ins&eacute;mination. Un accompagnement doux pour la conception."
              href="/services/fertilite"
              image="/site/judith/judith-portrait-07.webp"
            />
          </div>
          <div>
            <PilierCard
              title="Grossesse &amp; p&eacute;rinatalit&eacute;"
              description="Du premier trimestre au post-partum, un suivi adapt&eacute; &agrave; chaque &eacute;tape de votre grossesse."
              href="/services/grossesse"
              image="/site/judith/judith-portrait-06.webp"
              featured
            />
          </div>
          <div className="md:translate-y-12">
            <PilierCard
              title="Acupuncture sociale"
              description="Des soins accessibles &agrave; tous, selon votre capacit&eacute; financi&egrave;re. Tarification solidaire."
              href="/services/acupuncture-sociale"
              image="/site/judith/judith-portrait-02.webp"
            />
          </div>
        </div>
      </div>
    </PaperTexture>
  );
}
