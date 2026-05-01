import type { Metadata } from 'next';
import Link from 'next/link';
import CtaButton from '../_components/CtaButton';
import CtaBotanicalDeco from '../_components/CtaBotanicalDeco';
import SectionHeading from '../_components/SectionHeading';
import RessourceFaq from '../_components/RessourceFaq';
import Reveal from '../_components/animations/Reveal';
import StaggerChildren from '../_components/animations/StaggerChildren';
import HoverLift from '../_components/animations/HoverLift';

export const metadata: Metadata = {
  title: 'Tarifs — Acupuncture Rosemont et Repentigny',
  description:
    'Tarifs transparents. Consultation privee 100 $/h, acupuncture sociale 35-60 $. Rosemont et Repentigny. Recu pour assurances.',
};

const GRV_URL = '/reserver';

const OFFERS = [
  {
    kicker: 'CONSULTATION PRIVÉE',
    bg: 'bg-white',
    price: '100 $ <span class="text-[16px] font-normal text-public-text-medium">/ s&eacute;ance de 60 min</span>',
    desc: 'S&eacute;ance individuelle, en cabinet priv&eacute;. &Eacute;change approfondi, &eacute;valuation compl&egrave;te, plan d&rsquo;accompagnement personnalis&eacute;.',
    indications:
      '<strong>Indications</strong> : fertilit&eacute;, grossesse, sant&eacute; mentale, douleurs, bien-&ecirc;tre g&eacute;n&eacute;ral.<br/><span class="inline-block mt-2 text-public-text-medium"><strong>Tarif p&eacute;diatrique</strong> : 90 $ pour les enfants de 0 &agrave; 17 ans.</span>',
    ctaHref: '/reserver',
    ctaLabel: 'Prendre rendez-vous',
  },
  {
    kicker: 'ACUPUNCTURE SOCIALE',
    bg: 'bg-public-beige-light',
    price: '35 $ &agrave; 60 $ <span class="text-[16px] font-normal text-public-text-medium">/ tarif libre</span>',
    desc: 'S&eacute;ance en petit groupe, dans un espace partag&eacute; chaleureux. 60 minutes. Habill&eacute;(e), points distaux.',
    indications:
      '<strong>Indications</strong> : stress, anxi&eacute;t&eacute;, insomnie, sommeil, d&eacute;tente g&eacute;n&eacute;rale.',
    ctaHref: '/services/acupuncture-sociale',
    ctaLabel: 'En savoir plus',
  },
];

const INCLUSIONS = [
  'Un échange approfondi pour comprendre votre situation',
  'Une évaluation selon les principes de la médecine traditionnelle chinoise',
  'Le traitement avec aiguilles stériles à usage unique',
  'Des conseils personnalisés pour entre les séances',
  'Un <strong>reçu officiel émis par une acupunctrice membre de l’OAQ</strong> (remboursable par la plupart des assurances privées au Québec)',
];

const INFOS_PRATIQUES = [
  {
    title: 'Paiement',
    text: 'Comptant, débit, Visa, Mastercard, Interac. Paiement effectué à la fin de la séance.',
  },
  {
    title: 'Assurances',
    text: 'La plupart des régimes d’assurance privés au Québec couvrent l’acupuncture. Vérifiez votre contrat. Un reçu officiel OAQ est remis après chaque séance.',
  },
  {
    title: 'Annulation',
    text: 'Un délai de 24 heures est demandé pour toute annulation. En cas d’annulation tardive ou d’absence, des frais de 50 % du coût de la séance peuvent s’appliquer.',
  },
];

const FAQ_TARIFS = [
  {
    question: 'L’acupuncture est-elle remboursée par les assurances au Québec ?',
    answer:
      'Oui, la plupart des régimes d’assurance privés au Québec couvrent l’acupuncture lorsqu’elle est pratiquée par un membre de l’Ordre des acupuncteurs du Québec (OAQ). Vérifiez les modalités de votre contrat. Je remets un reçu officiel à chaque séance.',
  },
  {
    question: 'Quel est le tarif d’une première séance ?',
    answer:
      'Une première séance coûte 100 $ et dure 60 minutes. Ce tarif inclut l’échange initial approfondi, l’évaluation complète, le premier traitement et le plan d’accompagnement personnalisé.',
  },
  {
    question: 'Quel est le tarif pour une séance pédiatrique ?',
    answer:
      'Une séance pour enfant ou adolescent (0 à 17 ans) coûte 90 $ et dure 60 minutes. Le tarif inclut l’échange avec l’enfant et le parent, l’évaluation et le traitement adapté à l’âge (techniques douces, souvent sans aiguilles pour les plus petits).',
  },
  {
    question: 'Qu’est-ce que l’acupuncture sociale ?',
    answer:
      'L’acupuncture sociale est une séance en format de petit groupe, à tarif libre entre 35 $ et 60 $ selon vos moyens. C’est la même acupuncture — même formation, mêmes aiguilles stériles — simplement dans un format qui rend les soins accessibles à tous.',
  },
  {
    question: 'Puis-je payer par Interac ou par carte ?',
    answer:
      'Oui. J’accepte le comptant, Interac, Visa et Mastercard. Le paiement se fait à la fin de chaque séance.',
  },
  {
    question: 'Faut-il payer d’avance pour réserver ?',
    answer:
      'Non, il n’y a pas de frais de réservation. Vous réservez en ligne via Go Rendez-Vous et vous payez à la séance.',
  },
];

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: 'Judith Dufour-Savard — Acupuncture',
    telephone: '+1-514-750-3735',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '2554 rue Beaubien Est',
      addressLocality: 'Montréal',
      addressRegion: 'QC',
      postalCode: 'H1Y 1G3',
      addressCountry: 'CA',
    },
    priceRange: '$$',
    paymentAccepted: 'Cash, Credit Card, Debit Card, Interac',
    mainEntityOfPage: { '@id': 'https://acupuncturejudith.ca/#business' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services d’acupuncture',
      itemListElement: [
        {
          '@type': 'Offer',
          name: 'Consultation privée d’acupuncture',
          description: 'Séance individuelle de 60 minutes en cabinet privé',
          price: '100',
          priceCurrency: 'CAD',
          eligibleDuration: { '@type': 'QuantitativeValue', value: 60, unitCode: 'MIN' },
        },
        {
          '@type': 'Offer',
          name: 'Consultation pédiatrique d’acupuncture',
          description: 'Séance pour enfants de 0 à 17 ans, 60 minutes',
          price: '90',
          priceCurrency: 'CAD',
          eligibleDuration: { '@type': 'QuantitativeValue', value: 60, unitCode: 'MIN' },
        },
        {
          '@type': 'Offer',
          name: 'Acupuncture sociale',
          description: 'Séance en petit groupe, tarif libre 35-60 CAD',
          priceSpecification: {
            '@type': 'PriceSpecification',
            minPrice: '35',
            maxPrice: '60',
            priceCurrency: 'CAD',
          },
          eligibleDuration: {
            '@type': 'QuantitativeValue',
            value: 60,
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
      <section className="bg-gradient-to-b from-public-beige-bg to-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8 relative overflow-hidden">
        {/* SVG zen-stones filigrane droite */}
        <div className="absolute -right-[80px] top-[10px] w-[360px] h-[440px] pointer-events-none z-0 hidden lg:block" aria-hidden="true" style={{ transform: 'rotate(10deg)', opacity: 0.12, mixBlendMode: 'multiply' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/site/svg/zen-stones.svg" alt="" loading="lazy" className="w-full h-full object-contain" />
        </div>
        <div className="max-w-[860px] mx-auto text-center relative z-10">
          <Reveal>
            <SectionHeading
              kicker="TARIFS"
              title="Tarifs transparents, accessibles &agrave; tous."
              subtitle="Les prix de mes s&eacute;ances d&rsquo;acupuncture sont clairs, sans frais cach&eacute;s. Et parce que la sant&eacute; ne devrait pas &ecirc;tre un privil&egrave;ge, j&rsquo;offre aussi de l&rsquo;acupuncture sociale &agrave; tarif libre. Clinique &agrave; Rosemont (Beaubien Est) et &agrave; Repentigny (&Eacute;den Yoga Pilates)."
            />
          </Reveal>
        </div>
      </section>

      {/* 2 offres */}
      <section className="bg-white py-[68px] md:py-[88px] px-5 md:px-8">
        <StaggerChildren scale={0.92} y={28} stagger={0.12} className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {OFFERS.map((o) => (
            <HoverLift key={o.kicker}>
            <div className={`${o.bg} rounded-[14px] p-8 border border-public-border-subtle flex flex-col`}>
              <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-public-accent-taupe-dark mb-3">
                {o.kicker}
              </span>
              <h2 className="font-public-serif text-[28px] font-medium text-public-text-dark mb-2" dangerouslySetInnerHTML={{ __html: o.price }} />
              <p className="text-[15px] leading-relaxed text-public-text-medium mb-3 flex-1" dangerouslySetInnerHTML={{ __html: o.desc }} />
              <p className="text-[13px] text-public-text-light mb-5" dangerouslySetInnerHTML={{ __html: o.indications }} />
              <CtaButton variant="primary" href={o.ctaHref}>{o.ctaLabel}</CtaButton>
            </div>
            </HoverLift>
          ))}
        </StaggerChildren>
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
