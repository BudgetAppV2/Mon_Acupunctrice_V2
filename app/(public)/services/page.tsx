import type { Metadata } from 'next';
import SectionHeading from '../_components/SectionHeading';
import PilierCard from '../_components/PilierCard';

export const metadata: Metadata = {
  title: 'Services \u2014 Acupuncture a Rosemont, Montreal',
  description:
    'Mes services d\u2019acupuncture a Rosemont : fertilite, grossesse et perinatalite, pediatrie, acupuncture sociale. La Source en Soi, Beaubien Est.',
};

const SCHEMA_ORG = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://acupuncturejudith.ca/' },
    { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://acupuncturejudith.ca/services' },
  ],
};

export default function ServicesPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_ORG) }}
      />

      <section className="bg-gradient-to-b from-public-beige-bg to-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
        <div className="max-w-[960px] mx-auto text-center">
          <SectionHeading
            kicker="SERVICES"
            title="Ce pour quoi on me consulte."
            subtitle="Chaque parcours est unique. D&eacute;couvrez mes sp&eacute;cialit&eacute;s et trouvez l&rsquo;accompagnement qui vous convient."
          />
        </div>
      </section>

      <section className="bg-white py-[68px] md:py-[88px] px-5 md:px-8">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <PilierCard
            title="Fertilit\u00e9"
            description="Soutien en fertilit\u00e9 naturelle, FIV, ins\u00e9mination. Accompagnement dans le temps long."
            href="/services/fertilite"
            image="/site/judith/judith-portrait-07.webp"
          />
          <PilierCard
            title="Grossesse & p\u00e9rinatalit\u00e9"
            description="Du premier trimestre au post-partum. Naus\u00e9es, douleurs, pr\u00e9paration \u00e0 l\u2019accouchement."
            href="/services/grossesse"
            image="/site/judith/judith-portrait-06.webp"
          />
          <PilierCard
            title="P\u00e9diatrie"
            description="Acupuncture adapt\u00e9e aux enfants et aux b\u00e9b\u00e9s. Techniques douces, souvent sans aiguilles."
            href="/services/pediatrie"
            image="/site/judith/judith-portrait-02.webp"
          />
          <PilierCard
            title="Acupuncture sociale"
            description="Des soins accessibles \u00e0 tous, \u00e0 tarif r\u00e9duit. La sant\u00e9 ne devrait pas \u00eatre un privil\u00e8ge."
            href="/services/acupuncture-sociale"
            image="/site/judith/judith-portrait-03.webp"
          />
        </div>
      </section>
    </main>
  );
}
