import type { Metadata } from 'next';
import SectionHeading from '../_components/SectionHeading';
import PilierCard from '../_components/PilierCard';

export const metadata: Metadata = {
  title: 'Services — Acupuncture a Rosemont, Montreal',
  description:
    'Mes services d’acupuncture a Rosemont : fertilite, grossesse et perinatalite, pediatrie, acupuncture sociale. La Source en Soi, Beaubien Est.',
};

const SCHEMA_ORG = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.acupuncturejudith.ca/' },
    { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://www.acupuncturejudith.ca/services' },
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
            as="h1"
            kicker="SERVICES"
            title="Ce pour quoi on me consulte."
            subtitle="Chaque parcours est unique. D&eacute;couvrez mes sp&eacute;cialit&eacute;s et trouvez l&rsquo;accompagnement qui vous convient."
          />
        </div>
      </section>

      <section className="bg-white py-[68px] md:py-[88px] px-5 md:px-8">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <PilierCard
            title="Fertilité"
            description="Soutien en fertilité naturelle, FIV, insémination. Accompagnement dans le temps long."
            href="/services/fertilite"
            image="/site/judith/judith-portrait-07.webp"
          />
          <PilierCard
            title="Grossesse & périnatalité"
            description="Du premier trimestre au post-partum. Nausées, douleurs, préparation à l’accouchement."
            href="/services/grossesse"
            image="/site/judith/judith-portrait-06.webp"
          />
          <PilierCard
            title="Pédiatrie"
            description="Acupuncture adaptée aux enfants et aux bébés. Techniques douces, souvent sans aiguilles."
            href="/services/pediatrie"
            image="/site/judith/judith-portrait-02.webp"
          />
          <PilierCard
            title="Acupuncture sociale"
            description="Des soins accessibles à tous, à tarif réduit. La santé ne devrait pas être un privilège."
            href="/services/acupuncture-sociale"
            image="/site/judith/judith-portrait-03.webp"
          />
        </div>
      </section>
    </main>
  );
}
