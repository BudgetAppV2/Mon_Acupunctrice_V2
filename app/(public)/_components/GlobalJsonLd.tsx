// Graphe JSON-LD global — présent sur toutes les pages publiques via layout.tsx
// Contient les entités stables : WebSite, Person, MedicalBusiness, Place×2
// Les pages individuelles ajoutent leurs propres schemas (BreadcrumbList, FAQPage, etc.)
//
// 📌 Source canonique : `lib/entity-canonical.mjs` (toute valeur identitaire vient de là).
// 📌 Documentation primaire : `project-docs/02_ROADMAP/content-strategy/ENTITY_SOURCE_OF_TRUTH.md`

import { ENTITY, NAP, CONTACT, SAMEAS, PILIERS } from '@/lib/entity-canonical.mjs';

const BASE = CONTACT.website;
const PORTRAIT = `${BASE}${ENTITY.portraitImagePath}`;

const GLOBAL_GRAPH = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE}/#website`,
    name: ENTITY.websiteName,
    url: BASE,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${BASE}/#judith`,
    name: ENTITY.name,
    alternateName: ENTITY.alternateName,
    jobTitle: ENTITY.jobTitleShort,
    identifier: {
      '@type': 'PropertyValue',
      propertyID: ENTITY.oaqAcronym,
      name: "Numéro d'inscription à l'Ordre des acupuncteurs du Québec",
      value: ENTITY.oaqNumber,
    },
    url: BASE,
    image: PORTRAIT,
    memberOf: {
      '@type': 'Organization',
      name: ENTITY.oaqName,
      url: ENTITY.oaqUrl,
    },
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      name: ENTITY.diplomaLong,
      credentialCategory: 'degree',
      recognizedBy: {
        '@type': 'EducationalOrganization',
        name: ENTITY.school,
      },
    },
    // knowsAbout : "Acupuncture" générique + les 4 piliers actifs + MTC.
    // ⚠️ Les spécialités niveau 3 (émergentes, ex: ménopause) ne sont PAS
    // listées ici tant que la page correspondante n'est pas publiée.
    // Cf. EMERGING_SPECIALTIES dans entity-canonical.mjs.
    knowsAbout: [
      'Acupuncture',
      ...PILIERS.map((p) => p.name),
      'Médecine traditionnelle chinoise',
    ],
    workLocation: [
      { '@type': 'MedicalClinic', '@id': `${BASE}/#lssi`, name: NAP.lssi.name },
      { '@type': 'MedicalClinic', '@id': `${BASE}/#eden`, name: NAP.eden.name },
    ],
    sameAs: [...SAMEAS.social],
  },
  {
    '@context': 'https://schema.org',
    '@type': ['MedicalBusiness', 'LocalBusiness'],
    '@id': `${BASE}/#business`,
    name: ENTITY.businessName,
    alternateName: ENTITY.businessAlternateName,
    url: BASE,
    telephone: CONTACT.phone,
    email: CONTACT.email,
    image: PORTRAIT,
    // medicalSpecialty : enum schema.org en anglais (Acupuncture, Integrative Medicine).
    // Volontairement séparé des libellés français (knowsAbout / availableService).
    medicalSpecialty: ['Acupuncture', 'Integrative Medicine'],
    priceRange: '$$',
    availableService: PILIERS.map((p) => ({
      '@type': 'MedicalTherapy',
      name: p.labelLong,
    })),
    areaServed: [
      { '@type': 'City', name: NAP.lssi.addressLocality },
      { '@type': 'City', name: NAP.eden.addressLocality },
      { '@type': 'AdministrativeArea', name: NAP.lssi.borough },
    ],
    employee: { '@id': `${BASE}/#judith` },
    location: [
      {
        '@type': 'Place',
        '@id': `${BASE}/#lssi`,
        name: NAP.lssi.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: NAP.lssi.streetAddress,
          addressLocality: NAP.lssi.addressLocality,
          addressRegion: NAP.lssi.addressRegion,
          postalCode: NAP.lssi.postalCode,
          addressCountry: NAP.lssi.addressCountry,
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: NAP.lssi.geo.latitude,
          longitude: NAP.lssi.geo.longitude,
        },
        // ⚠️ aggregateRating est attaché au Place LSSI globalement, pas à
        // Judith. Données externes (Google Reviews de la clinique).
        // À actualiser périodiquement, ou retirer une fois la fiche GBP
        // de Judith elle-même atteignant 20+ avis (Chantier 2 du plan op).
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
        name: NAP.eden.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: NAP.eden.streetAddressFull,
          addressLocality: NAP.eden.addressLocality,
          addressRegion: NAP.eden.addressRegion,
          postalCode: NAP.eden.postalCode,
          addressCountry: NAP.eden.addressCountry,
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: NAP.eden.geo.latitude,
          longitude: NAP.eden.geo.longitude,
        },
      },
    ],
    sameAs: [...SAMEAS.social, ...SAMEAS.business],
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
