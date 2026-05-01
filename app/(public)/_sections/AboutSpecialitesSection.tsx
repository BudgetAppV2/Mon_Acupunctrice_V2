'use client';

import Reveal from '../_components/animations/Reveal';
import SectionHeading from '../_components/SectionHeading';
import PilierCard from '../_components/PilierCard';

export default function AboutSpecialitesSection() {
  return (
    <section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[1280px] mx-auto">
        <SectionHeading
          kicker="MES SP&Eacute;CIALIT&Eacute;S"
          title="Ce pour quoi on me consulte."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <PilierCard
            title="Fertilit&eacute;"
            description="Soutien en fertilit&eacute; naturelle, FIV, ins&eacute;mination. Accompagnement dans le temps long, avec douceur."
            href="/services/fertilite"
            image="/site/judith/judith-portrait-07.webp"
          />
          <PilierCard
            title="Grossesse &amp; p&eacute;rinatalit&eacute;"
            description="Du premier trimestre au post-partum. Naus&eacute;es, douleurs, pr&eacute;paration &agrave; l'accouchement, moxibustion."
            href="/services/grossesse"
            image="/site/judith/judith-portrait-06.webp"
          />
          <PilierCard
            title="P&eacute;diatrie"
            description="Acupuncture adapt&eacute;e aux enfants et aux b&eacute;b&eacute;s. Techniques douces, souvent sans aiguilles (aimants, shino shin)."
            href="/services/pediatrie"
            image="/site/judith/judith-portrait-02.webp"
          />
          <PilierCard
            title="Acupuncture sociale"
            description="Des soins accessibles &agrave; tous, &agrave; tarif r&eacute;duit. Parce que la sant&eacute; ne devrait pas &ecirc;tre un privil&egrave;ge."
            href="/services/acupuncture-sociale"
            image="/site/judith/judith-portrait-03.webp"
          />
        </div>
      </div>
    </section>
  );
}
