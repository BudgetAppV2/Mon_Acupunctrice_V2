import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPublishedFaqs } from '@/lib/firestore/public-faq';
import MarkdownRenderer from '../_components/MarkdownRenderer';
import SectionHeading from '../_components/SectionHeading';
import CtaBotanicalDeco from '../_components/CtaBotanicalDeco';
import CtaButton from '../_components/CtaButton';
import type { FAQ, FaqCategory } from '@/lib/types/faq';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Questions frequentes \u2014 Acupuncture a Rosemont, Montreal',
  description:
    'Reponses aux questions les plus courantes sur l\u2019acupuncture en fertilite, grossesse, anxiete. Membre OAQ, La Source en Soi, Rosemont.',
};

const CATEGORY_LABELS: Record<FaqCategory, string> = {
  seance: 'Questions g\u00e9n\u00e9rales',
  fertilite: 'Fertilit\u00e9',
  grossesse: 'Grossesse & p\u00e9rinatalit\u00e9',
  pediatrie: 'P\u00e9diatrie',
  'acupuncture-sociale': 'Acupuncture sociale',
};

// Ordre d'affichage des categories (SEO : seance generique d'abord, puis piliers)
const CATEGORY_ORDER: FaqCategory[] = [
  'seance',
  'fertilite',
  'grossesse',
  'pediatrie',
  'acupuncture-sociale',
];

function groupByCategory(faqs: FAQ[]): Array<[FaqCategory, FAQ[]]> {
  const groups = new Map<FaqCategory, FAQ[]>();
  for (const faq of faqs) {
    if (!groups.has(faq.category)) groups.set(faq.category, []);
    groups.get(faq.category)!.push(faq);
  }
  return CATEGORY_ORDER.filter((c) => groups.has(c)).map((c) => [c, groups.get(c)!]);
}

// Strip markdown pour le Schema.org FAQPage (texte brut, limite a 500 chars)
function plainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#*_`>[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

export default async function FaqPage() {
  const faqs = await getAllPublishedFaqs();
  const grouped = groupByCategory(faqs);

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: plainText(f.reponse) },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://acupuncturejudith.ca/' },
        { '@type': 'ListItem', position: 2, name: 'FAQ', item: 'https://acupuncturejudith.ca/faq' },
      ],
    },
  ];

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-public-beige-bg to-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
        <div className="max-w-[860px] mx-auto text-center">
          <SectionHeading
            kicker="FAQ"
            title="Questions fr&eacute;quentes"
            subtitle="Les r&eacute;ponses aux questions que mes patientes me posent le plus souvent. Si votre question n&rsquo;est pas ici, n&rsquo;h&eacute;sitez pas &agrave; me contacter."
          />
        </div>
      </section>

      {/* FAQ groupees par categorie */}
      <section className="bg-white py-[68px] md:py-[88px] px-5 md:px-8">
        <div className="max-w-[860px] mx-auto space-y-16">
          {grouped.map(([category, items]) => (
            <div key={category}>
              <h2 className="font-public-serif text-[24px] md:text-[30px] font-medium text-public-text-dark mb-8">
                {CATEGORY_LABELS[category]}
              </h2>
              <div className="space-y-4">
                {items.map((faq) => (
                  <details
                    key={faq.id}
                    className="group bg-public-beige-light border border-public-border-subtle rounded-[12px] overflow-hidden open:shadow-public-sm transition-shadow"
                  >
                    <summary className="px-6 py-5 font-public-serif text-[17px] font-semibold text-public-text-dark cursor-pointer list-none flex justify-between items-start gap-3 hover:bg-public-beige-warm/30 transition-colors">
                      <span>{faq.question}</span>
                      <span
                        className="text-public-accent-warm shrink-0 group-open:rotate-45 transition-transform text-xl leading-none"
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </summary>
                    <div className="px-6 pb-6">
                      <MarkdownRenderer content={faq.reponse} />

                      {/* Cross-link vers service lie (sauf pour les FAQ generiques) */}
                      {category !== 'seance' && (
                        <div className="mt-2 pt-4 border-t border-public-border-subtle">
                          <Link
                            href={`/services/${category}`}
                            className="text-[14px] font-medium text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
                          >
                            Voir le service {CATEGORY_LABELS[category]} &rarr;
                          </Link>
                        </div>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-gradient-to-b from-public-accent-taupe to-public-accent-taupe-dark text-white py-[68px] md:py-[88px] px-5 md:px-8 text-center relative overflow-hidden">
        <CtaBotanicalDeco />
        <div className="max-w-[620px] mx-auto relative z-10">
          <h2 className="font-public-serif text-[28px] md:text-[40px] font-medium mb-4">
            Votre question n&rsquo;est pas ici ?
          </h2>
          <p className="text-[16px] italic opacity-90 mb-8 font-public-serif">
            Contactez-moi directement. Je r&eacute;ponds habituellement dans les 48 heures ouvrables.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
            <CtaButton
              variant="white"
              size="lg"
              href="https://www.gorendezvous.com/lasourceensoi?companyId=104074"
            >
              Prendre rendez-vous
            </CtaButton>
            <Link
              href="/contact"
              className="text-white/80 hover:text-white underline underline-offset-4 text-[14px]"
            >
              Me contacter
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
