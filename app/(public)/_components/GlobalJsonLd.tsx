// Graphe JSON-LD global — présent sur toutes les pages publiques via layout.tsx
// Contient les entités stables : WebSite, Person, MedicalBusiness, Place×2
// Les pages individuelles ajoutent leurs propres schemas (BreadcrumbList, FAQPage, etc.)

const BASE = 'https://www.acupuncturejudith.ca';

const SAME_AS = [
  'https://www.wikidata.org/wiki/Q139677208',
  'https://www.instagram.com/mon_acupunctrice/',
  'https://www.youtube.com/@JudithDufourSavard',
  'https://www.facebook.com/profile.php?id=61562614934143',
  'https://www.linkedin.com/in/judith-dufour-savard-acu/',
];

const GLOBAL_GRAPH = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE}/#website`,
    name: 'Judith Dufour-Savard — Acupunctrice',
    url: BASE,
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
      // 'Ménopause', — ajouté quand la ressource sera publiée
      'Acupuncture sociale',
      'Médecine traditionnelle chinoise',
    ],
    workLocation: [
      { '@type': 'MedicalClinic', '@id': `${BASE}/#lssi`, name: 'La Source en Soi' },
      { '@type': 'MedicalClinic', '@id': `${BASE}/#eden`, name: 'Éden Yoga Pilates' },
    ],
    sameAs: SAME_AS,
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
      // { '@type': 'MedicalTherapy', name: 'Acupuncture pour la ménopause' }, — ajouté quand la ressource sera publiée
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
      ...SAME_AS,
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
