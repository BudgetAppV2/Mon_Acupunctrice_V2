import type { Metadata } from 'next';
import Link from 'next/link';
import CtaButton from '../_components/CtaButton';
import CtaBotanicalDeco from '../_components/CtaBotanicalDeco';
import SectionHeading from '../_components/SectionHeading';
import RessourceFaq from '../_components/RessourceFaq';

export const metadata: Metadata = {
  title: 'Tarifs \u2014 Acupuncture a Rosemont, Montreal',
  description:
    'Tarifs transparents pour mes services d\u2019acupuncture a La Source en Soi (Rosemont). Consultation privee 90 $/h, acupuncture sociale a tarif libre (35-50 $). Recu pour assurances.',
};

const GRV_URL = 'https://www.gorendezvous.com/lasourceensoi?companyId=104074';

const OFFERS = [
  {
    kicker: 'CONSULTATION PRIV\u00c9E',
    bg: 'bg-white',
    price: '90 $ <span class="text-[16px] font-normal text-public-text-medium">/ s&eacute;ance de 60 min</span>',
    desc: 'S&eacute;ance individuelle, en cabinet priv&eacute;. &Eacute;change approfondi, &eacute;valuation compl&egrave;te, plan d&rsquo;accompagnement personnalis&eacute;.',
    indications:
      '<strong>Indications</strong> : fertilit&eacute;, grossesse, p&eacute;diatrie, sant&eacute; mentale, douleurs, bien-&ecirc;tre g&eacute;n&eacute;ral.',
    ctaHref: 'https://www.gorendezvous.com/lasourceensoi?companyId=104074',
    ctaLabel: 'Prendre rendez-vous',
  },
  {
    kicker: 'ACUPUNCTURE SOCIALE',
    bg: 'bg-public-beige-light',
    price: '35 $ &agrave; 50 $ <span class="text-[16px] font-normal text-public-text-medium">/ tarif libre</span>',
    desc: 'S&eacute;ance en petit groupe, dans un espace partag&eacute; chaleureux. 30 &agrave; 45 minutes. Habill&eacute;(e), points distaux.',
    indications:
      '<strong>Indications</strong> : stress, anxi&eacute;t&eacute;, insomnie, sommeil, d&eacute;tente g&eacute;n&eacute;rale.',
    ctaHref: '/services/acupuncture-sociale',
    ctaLabel: 'En savoir plus',
  },
];

const INCLUSIONS = [
  'Un \u00e9change approfondi pour comprendre votre situation',
  'Une \u00e9valuation selon les principes de la m\u00e9decine traditionnelle chinoise',
  'Le traitement avec aiguilles st\u00e9riles \u00e0 usage unique',
  'Des conseils personnalis\u00e9s pour entre les s\u00e9ances',
  'Un <strong>re\u00e7u officiel \u00e9mis par une acupunctrice membre de l\u2019OAQ</strong> (remboursable par la plupart des assurances priv\u00e9es au Qu\u00e9bec)',
];

const INFOS_PRATIQUES = [
  {
    title: 'Paiement',
    text: 'Comptant, d\u00e9bit, Visa, Mastercard, Interac. Paiement effectu\u00e9 \u00e0 la fin de la s\u00e9ance.',
  },
  {
    title: 'Assurances',
    text: 'La plupart des r\u00e9gimes d\u2019assurance priv\u00e9s au Qu\u00e9bec couvrent l\u2019acupuncture. V\u00e9rifiez votre contrat. Un re\u00e7u officiel OAQ est remis apr\u00e8s chaque s\u00e9ance.',
  },
  {
    title: 'Annulation',
    text: 'Un d\u00e9lai de 24 heures est demand\u00e9 pour toute annulation. En cas d\u2019annulation tardive ou d\u2019absence, des frais de 50 % du co\u00fbt de la s\u00e9ance peuvent s\u2019appliquer.',
  },
];

const FAQ_TARIFS = [
  {
    question: 'L\u2019acupuncture est-elle rembours\u00e9e par les assurances au Qu\u00e9bec ?',
    answer:
      'Oui, la plupart des r\u00e9gimes d\u2019assurance priv\u00e9s au Qu\u00e9bec couvrent l\u2019acupuncture lorsqu\u2019elle est pratiqu\u00e9e par un membre de l\u2019Ordre des acupuncteurs du Qu\u00e9bec (OAQ). V\u00e9rifiez les modalit\u00e9s de votre contrat. Je remets un re\u00e7u officiel \u00e0 chaque s\u00e9ance.',
  },
  {
    question: 'Quel est le tarif d\u2019une premi\u00e8re s\u00e9ance ?',
    answer:
      'Une premi\u00e8re s\u00e9ance co\u00fbte 90 $ et dure 60 minutes. Ce tarif inclut l\u2019\u00e9change initial approfondi, l\u2019\u00e9valuation compl\u00e8te, le premier traitement et le plan d\u2019accompagnement personnalis\u00e9.',
  },
  {
    question: 'Qu\u2019est-ce que l\u2019acupuncture sociale ?',
    answer:
      'L\u2019acupuncture sociale est une s\u00e9ance en format de petit groupe, \u00e0 tarif libre entre 35 $ et 50 $ selon vos moyens. C\u2019est la m\u00eame acupuncture \u2014 m\u00eame formation, m\u00eames aiguilles st\u00e9riles \u2014 simplement dans un format qui rend les soins accessibles \u00e0 tous.',
  },
  {
    question: 'Puis-je payer par Interac ou par carte ?',
    answer:
      'Oui. J\u2019accepte le comptant, Interac, Visa et Mastercard. Le paiement se fait \u00e0 la fin de chaque s\u00e9ance.',
  },
  {
    question: 'Faut-il payer d\u2019avance pour r\u00e9server ?',
    answer:
      'Non, il n\u2019y a pas de frais de r\u00e9servation. Vous r\u00e9servez en ligne via Go Rendez-Vous et vous payez \u00e0 la s\u00e9ance.',
  },
];

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: 'Judith Dufour-Savard \u2014 Acupuncture',
    telephone: '+1-514-750-3735',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '2554 rue Beaubien Est',
      addressLocality: 'Montr\u00e9al',
      addressRegion: 'QC',
      postalCode: 'H1Y 1G3',
      addressCountry: 'CA',
    },
    priceRange: '$$',
    paymentAccepted: 'Cash, Credit Card, Debit Card, Interac',
    mainEntityOfPage: { '@id': 'https://acupuncturejudith.ca/#business' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services d\u2019acupuncture',
      itemListElement: [
        {
          '@type': 'Offer',
          name: 'Consultation priv\u00e9e d\u2019acupuncture',
          description: 'S\u00e9ance individuelle de 60 minutes en cabinet priv\u00e9',
          price: '90',
          priceCurrency: 'CAD',
          eligibleDuration: { '@type': 'QuantitativeValue', value: 60, unitCode: 'MIN' },
        },
        {
          '@type': 'Offer',
          name: 'Acupuncture sociale',
          description: 'S\u00e9ance en petit groupe, tarif libre 35-50 $',
          priceSpecification: {
            '@type': 'PriceSpecification',
            minPrice: '35',
            maxPrice: '50',
            priceCurrency: 'CAD',
          },
          eligibleDuration: {
            '@type': 'QuantitativeValue',
            minValue: 30,
            maxValue: 45,
            unitCode: 'MIN',
          },
        },
      ],
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_TARIFS.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://acupuncturejudith.ca/' },
      { '@type': 'ListItem', position: 2, name: 'Tarifs', item: 'https://acupuncturejudith.ca/tarifs' },
    ],
  },
];

export default function TarifsPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-public-beige-bg to-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
        <div className="max-w-[860px] mx-auto text-center">
          <SectionHeading
            kicker="TARIFS"
            title="Tarifs transparents, accessibles &agrave; tous."
            subtitle="Les prix de mes s&eacute;ances d&rsquo;acupuncture sont clairs, sans frais cach&eacute;s. Et parce que la sant&eacute; ne devrait pas &ecirc;tre un privil&egrave;ge, j&rsquo;offre aussi de l&rsquo;acupuncture sociale &agrave; tarif libre. Clinique &agrave; Rosemont, sur Beaubien Est."
          />
        </div>
      </section>

      {/* 2 offres */}
      <section className="bg-white py-[68px] md:py-[88px] px-5 md:px-8">
        <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {OFFERS.map((o) => (
            <div key={o.kicker} className={`${o.bg} rounded-[14px] p-8 border border-public-border-subtle flex flex-col`}>
              <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-public-accent-taupe-dark mb-3">
                {o.kicker}
              </span>
              <h2 className="font-public-serif text-[28px] font-medium text-public-text-dark mb-2" dangerouslySetInnerHTML={{ __html: o.price }} />
              <p className="text-[15px] leading-relaxed text-public-text-medium mb-3 flex-1" dangerouslySetInnerHTML={{ __html: o.desc }} />
              <p className="text-[13px] text-public-text-light mb-5" dangerouslySetInnerHTML={{ __html: o.indications }} />
              <CtaButton variant="primary" href={o.ctaHref}>{o.ctaLabel}</CtaButton>
            </div>
          ))}
        </div>
      </section>

      {/* Ce qui est inclus */}
      <section className="bg-public-beige-bg py-[68px] md:py-[88px] px-5 md:px-8">
        <div className="max-w-[780px] mx-auto">
          <SectionHeading kicker="CE QUI EST INCLUS" title="Ce que votre investissement comprend." align="left" />
          <ul className="mt-10 space-y-4">
            {INCLUSIONS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[16px] leading-relaxed text-public-text-medium">
                <CheckIcon />
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Infos pratiques */}
      <section className="bg-white py-[68px] md:py-[88px] px-5 md:px-8">
        <div className="max-w-[1080px] mx-auto">
          <SectionHeading kicker="INFOS PRATIQUES" title="Informations pratiques." />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {INFOS_PRATIQUES.map((info) => (
              <div key={info.title} className="bg-white rounded-[14px] p-6 border border-public-border-subtle">
                <h3 className="font-public-serif text-[20px] font-semibold mb-2 text-public-text-dark">{info.title}</h3>
                <p className="text-[14px] text-public-text-medium leading-relaxed">{info.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ tarifs */}
      <section className="bg-public-beige-light py-[68px] md:py-[88px] px-5 md:px-8">
        <div className="max-w-[860px] mx-auto">
          <SectionHeading kicker="QUESTIONS FR&Eacute;QUENTES" title="Questions fr&eacute;quentes sur les tarifs." align="left" />
          <div className="mt-12">
            <RessourceFaq entries={FAQ_TARIFS} />
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-gradient-to-b from-public-accent-taupe to-public-accent-taupe-dark text-white py-[68px] md:py-[88px] px-5 md:px-8 text-center relative overflow-hidden">
        <CtaBotanicalDeco />
        <div className="max-w-[620px] mx-auto relative z-10">
          <h2 className="font-public-serif text-[28px] md:text-[40px] font-medium mb-4">
            Pr&ecirc;te &agrave; commencer ?
          </h2>
          <p className="text-[16px] italic opacity-90 mb-8 font-public-serif">
            Une premi&egrave;re rencontre dure 60 minutes. On prend le temps de comprendre votre situation
            et de b&acirc;tir ensemble un plan adapt&eacute;.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
            <CtaButton variant="white" size="lg" href={GRV_URL}>Prendre rendez-vous</CtaButton>
            <Link href="/contact" className="text-white/80 hover:text-white underline underline-offset-4 text-[14px]">
              J&rsquo;ai une question
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-public-accent-warm shrink-0 mt-0.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}
