// Graphe JSON-LD global — présent sur toutes les pages publiques via layout.tsx
// Contient les entités stables : WebSite, Person, MedicalBusiness, Place×2
// Les pages individuelles ajoutent leurs propres schemas (BreadcrumbList, FAQPage, etc.)

const BASE = 'https://www.acupuncturejudith.ca';

const GLOBAL_GRAPH = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE}/#website`,
    name: 'Judith Dufour-Savard — Acupunctrice',
    url: BASE,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE}/faq?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${BASE}/#judith`,
    name: 'Judith Dufour-Savard',
    alternateName: 'Judith Dufour-Savard, Ac.',
    jobTitle: 'Acupunctrice',
    url: BASE,
    image: `${BASE}/site/judith/judith-portrait-01.webp`,
    memberOf: {
      '@type': 'Organization',
      name: "Ordre des acupuncteurs du Québec",
      url: 'https://o-a-q.org',
    },
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      name: "Diplôme d'études collégiales en acupuncture",
      credentialCategory: 'degree',
      recognizedBy: {
        '@type': 'EducationalOrganization',
        name: 'Collège de Rosemont',
      },
    },
    knowsAbout: [
      'Acupuncture',
      'Fertilité',
      'Grossesse',
      'Pédiatrie',
      'Ménopause',
      'Acupuncture sociale',
      'Médecine traditionnelle chinoise',
    ],
    workLocation: [
      { '@type': 'MedicalClinic', '@id': `${BASE}/#lssi`, name: 'La Source en Soi' },
      { '@type': 'MedicalClinic', '@id': `${BASE}/#eden`, name: 'Éden Yoga Pilates' },
    ],
    sameAs: [
      'https://www.wikidata.org/wiki/Q139677208',
      'https://www.instagram.com/judith.acupuncture/',
      'https://www.linkedin.com/in/judith-dufour-savard-acu/',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': ['MedicalBusiness', 'LocalBusiness'],
    '@id': `${BASE}/#business`,
    name: 'Judith Dufour-Savard — Acupuncture',
    alternateName: 'Acupuncture Judith',
    url: BASE,
    telephone: '+1-514-750-3735',
    email: 'info@acupuncturejudith.ca',
    image: `${BASE}/site/judith/judith-portrait-01.webp`,
    medicalSpecialty: ['Acupuncture', 'Integrative Medicine'],
    priceRange: '$$',
    availableService: [
      { '@type': 'MedicalTherapy', name: 'Acupuncture en fertilité' },
      { '@type': 'MedicalTherapy', name: 'Acupuncture en grossesse' },
      { '@type': 'MedicalTherapy', name: 'Acupuncture pédiatrique' },
      { '@type': 'MedicalTherapy', name: 'Acupuncture sociale' },
      { '@type': 'MedicalTherapy', name: 'Acupuncture pour la ménopause' },
    ],
    areaServed: [
      { '@type': 'City', name: 'Montréal' },
      { '@type': 'City', name: 'Repentigny' },
      { '@type': 'AdministrativeArea', name: 'Rosemont—La Petite-Patrie' },
    ],
    employee: { '@id': `${BASE}/#judith` },
    location: [
      {
        '@type': 'Place',
        '@id': `${BASE}/#lssi`,
        name: 'La Source en Soi',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '2554 rue Beaubien Est',
          addressLocality: 'Montréal',
          addressRegion: 'QC',
          postalCode: 'H1Y 1G3',
          addressCountry: 'CA',
        },
        geo: { '@type': 'GeoCoordinates', latitude: 45.5408, longitude: -73.5823 },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '1215',
          bestRating: '5',
        },
      },
      {
        '@type': 'Place',
        '@id': `${BASE}/#eden`,
        name: 'Éden Yoga Pilates',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '121 Boul. Industriel #225',
          addressLocality: 'Repentigny',
          addressRegion: 'QC',
          addressCountry: 'CA',
        },
      },
    ],
    sameAs: [
      'https://www.wikidata.org/wiki/Q139677208',
      'https://www.instagram.com/judith.acupuncture/',
      'https://lasourceensoi.com/',
    ],
  },
];

export default function GlobalJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(GLOBAL_GRAPH) }}
    />
  );
}
