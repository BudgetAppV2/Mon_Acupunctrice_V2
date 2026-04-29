import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getRessourceBySlug,
  getAllPublishedRessources,
  getRelatedRessources,
} from '@/lib/firestore/public-ressources';
import MarkdownRenderer from '../../_components/MarkdownRenderer';
import RessourceCard from '../../_components/RessourceCard';
import RessourceFaq from '../../_components/RessourceFaq';
import CtaButton from '../../_components/CtaButton';
import SectionHeading from '../../_components/SectionHeading';

export const revalidate = 3600;

const PILIER_LABELS: Record<string, string> = {
  fertilite: 'FERTILITE',
  grossesse: 'GROSSESSE',
  pediatrie: 'PEDIATRIE',
  'acupuncture-sociale': 'ACUPUNCTURE SOCIALE',
  transversal: 'SANTE MENTALE',
};

const PILIER_SERVICE_URL: Record<string, string | null> = {
  fertilite: '/services/fertilite',
  grossesse: '/services/grossesse',
  pediatrie: '/services/pediatrie',
  'acupuncture-sociale': '/services/acupuncture-sociale',
  transversal: null,
};

// SSG : pre-build les ressources publiees
export async function generateStaticParams() {
  const all = await getAllPublishedRessources();
  return all.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = await getRessourceBySlug(slug);
  if (!r) return { title: 'Ressource non trouvee' };
  return {
    title: r.metaTitle,
    description: r.metaDescription,
    openGraph: {
      title: r.metaTitle,
      description: r.metaDescription,
      type: 'article',
      ...(r.heroImageUrl ? { images: [{ url: r.heroImageUrl }] } : {}),
    },
  };
}

export default async function RessourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ressource = await getRessourceBySlug(slug);

  if (!ressource) notFound();

  const related = await getRelatedRessources(slug, ressource.pilier, 3);
  const servicePageUrl = PILIER_SERVICE_URL[ressource.pilier];

  // Schema.org : MedicalWebPage + FAQPage (si entries)
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalWebPage',
      name: ressource.metaTitle,
      description: ressource.metaDescription,
      medicalAudience: 'Patient',
      mainEntity: {
        '@type': 'MedicalTherapy',
        name: ressource.title,
        relevantSpecialty: 'Integrative Medicine',
      },
    },
    ressource.faqEntries && ressource.faqEntries.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: ressource.faqEntries.map((e) => ({
            '@type': 'Question',
            name: e.question,
            acceptedAnswer: { '@type': 'Answer', text: e.answer },
          })),
        }
      : null,
  ].filter(Boolean);

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <header className="bg-gradient-to-b from-public-beige-bg to-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
        <div className="max-w-[860px] mx-auto">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[2.5px] text-public-accent-taupe-dark mb-4">
            {PILIER_LABELS[ressource.pilier] ?? ressource.pilier}
          </span>
          <h1 className="font-public-serif text-[36px] md:text-[52px] font-medium leading-[1.1] text-public-text-dark mb-6">
            {ressource.title}
          </h1>
          <p className="text-[18px] leading-[1.65] text-public-text-medium">
            {ressource.shortAnswer}
          </p>
        </div>
      </header>

      {/* Body sections — 7 sections markdown sequentielles */}
      <div className="bg-white py-[68px] md:py-[88px] px-5 md:px-8">
        <div className="max-w-[780px] mx-auto space-y-16">
          {[
            ressource.introSection,
            ressource.judithApproach,
            ressource.whatToExpect,
            ressource.protocolSection,
            ressource.scienceSection,
            ressource.mechanismSection,
            ressource.testimonial,
          ].map((content, idx) =>
            content ? (
              <section key={idx}>
                <MarkdownRenderer content={content} />
              </section>
            ) : null
          )}
        </div>
      </div>

      {/* FAQ — accordeon natif <details> */}
      {ressource.faqEntries && ressource.faqEntries.length > 0 && (
        <section className="bg-public-beige-light py-[68px] md:py-[88px] px-5 md:px-8">
          <div className="max-w-[860px] mx-auto">
            <SectionHeading
              kicker="QUESTIONS FREQUENTES"
              title="Ce qu&rsquo;on me demande le plus souvent"
              align="left"
            />
            <div className="mt-12">
              <RessourceFaq entries={ressource.faqEntries} />
            </div>
          </div>
        </section>
      )}

      {/* Citations scientifiques */}
      {ressource.citations && ressource.citations.length > 0 && (
        <section className="bg-white py-[48px] px-5 md:px-8 border-t border-public-border-subtle">
          <div className="max-w-[780px] mx-auto">
            <h2 className="font-public-serif text-[22px] font-medium text-public-text-dark mb-6">
              Sources scientifiques
            </h2>
            <ol className="space-y-3 text-[14px] text-public-text-medium leading-relaxed">
              {ressource.citations.map((c, i) => (
                <li key={i} className="pl-2">
                  <span className="font-medium">{c.authors}</span>
                  {' \u2014 '}
                  <em>{c.title}</em>
                  {'. '}
                  {c.journal}, {c.year}.
                  {c.url && (
                    <>
                      {' '}
                      <a href={c.url} target="_blank" rel="noopener noreferrer"
                         className="text-public-accent-taupe-dark underline underline-offset-2">
                        Lire l&rsquo;&eacute;tude
                      </a>
                    </>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Articles de blog associes */}
      {ressource.relatedArticles && ressource.relatedArticles.length > 0 && (
        <section className="bg-public-beige-bg py-[48px] px-5 md:px-8">
          <div className="max-w-[780px] mx-auto">
            <h3 className="text-[16px] font-semibold text-public-text-dark mb-3">
              Articles de blog sur ce sujet
            </h3>
            <ul className="space-y-2">
              {ressource.relatedArticles.map((articleSlug) => (
                <li key={articleSlug}>
                  <Link href={`/blog/${articleSlug}`} className="text-public-accent-taupe-dark underline underline-offset-2 text-[14px]">
                    {articleSlug.replace(/-/g, ' ')}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* CTA cross-link vers page service correspondante */}
      {servicePageUrl && (
        <section className="bg-gradient-to-b from-public-accent-taupe to-public-accent-taupe-dark text-white py-[68px] md:py-[88px] px-5 md:px-8 text-center">
          <div className="max-w-[620px] mx-auto">
            <h2 className="font-public-serif text-[28px] md:text-[40px] font-medium mb-4">
              Envie d&rsquo;en parler ?
            </h2>
            <p className="text-[16px] italic opacity-90 mb-8 font-public-serif">
              Le guide vous donne le contexte. La premi&egrave;re s&eacute;ance, on le vit ensemble.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <CtaButton
                variant="white"
                size="lg"
                href="/reserver"
              >
                Prendre rendez-vous
              </CtaButton>
              <CtaButton
                variant="secondary"
                href={servicePageUrl}
                className="text-white/80 hover:text-white"
              >
                Voir la page service
              </CtaButton>
            </div>
          </div>
        </section>
      )}

      {/* Ressources associees */}
      {related.length > 0 && (
        <section className="bg-white py-[68px] md:py-[88px] px-5 md:px-8 border-t border-public-border-subtle">
          <div className="max-w-[1280px] mx-auto">
            <SectionHeading
              kicker="POUR ALLER PLUS LOIN"
              title="Autres ressources"
              align="left"
            />
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r) => (
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
          </div>
        </section>
      )}

      {/* Retour */}
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-12 text-center">
        <Link
          href="/ressources"
          className="text-public-accent-taupe-dark underline underline-offset-4 text-sm"
        >
          Retour a toutes les ressources
        </Link>
      </div>
    </article>
  );
}
