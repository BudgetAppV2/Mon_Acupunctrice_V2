import type { Metadata } from 'next';
import { getAllPublishedRessources } from '@/lib/firestore/public-ressources';
import SectionHeading from '../_components/SectionHeading';
import RessourceCard from '../_components/RessourceCard';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Ressources',
  description:
    'Guides complets sur l’acupuncture en fertilite, grossesse, pediatrie, acupuncture sociale et sante mentale. Etudes scientifiques recentes, protocoles documentes, FAQ.',
};

const PILIER_ORDER = [
  'fertilite',
  'grossesse',
  'pediatrie',
  'acupuncture-sociale',
  'transversal',
];

export default async function RessourcesIndexPage() {
  const ressources = await getAllPublishedRessources();

  // Tri deterministe : par pilier (ordre fixe) puis par titre
  const sorted = ressources.sort((a, b) => {
    const aIdx = PILIER_ORDER.indexOf(a.pilier);
    const bIdx = PILIER_ORDER.indexOf(b.pilier);
    if (aIdx !== bIdx) return aIdx - bIdx;
    return a.title.localeCompare(b.title, 'fr');
  });

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-b from-public-beige-bg to-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
        <div className="max-w-[960px] mx-auto text-center">
          <SectionHeading
            kicker="LE GUIDE COMPLET"
            title="Ressources"
            subtitle="Des guides approfondis sur l&rsquo;acupuncture en fertilite, grossesse, pediatrie, acupuncture sociale et sante mentale. Etudes scientifiques recentes, protocoles documentes, et les reponses aux questions qu&rsquo;on me pose le plus souvent."
          />
        </div>
      </section>

      {/* Liste des ressources */}
      <section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8">
        <div className="max-w-[1280px] mx-auto">
          {sorted.length === 0 ? (
            <p className="text-center text-public-text-medium">
              Aucune ressource disponible pour le moment.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((r) => (
                <RessourceCard
                  key={r.slug}
                  ressource={{
                    slug: r.slug,
                    title: r.title,
                    metaDescription: r.metaDescription,
                    pilier: r.pilier,
                    shortAnswer: r.shortAnswer,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
