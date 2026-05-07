/**
 * entity-canonical.mjs — Source canonique d'entité runtime
 *
 * ⚠️ Ce fichier reflète `project-docs/02_ROADMAP/content-strategy/ENTITY_SOURCE_OF_TRUTH.md`.
 * Toute modification ici doit aussi être faite dans le SOT (et inversement).
 * Le SOT reste la documentation primaire ; ce fichier est la version exécutable
 * pour le code.
 *
 * Consommateurs :
 *   - app/(public)/_components/GlobalJsonLd.tsx       (schema JSON-LD)
 *   - lib/utils/rdvUrl.ts                              (URLs réservation)
 *   - scripts/generate-llms.mjs                        (public/llms.txt)
 *   - scripts/generate-llms-full.mjs                   (public/llms-full.txt)
 *
 * Format : JavaScript ESM (.mjs) pour être lisible à la fois par les fichiers
 * TypeScript (via le `.d.ts` voisin) et par les scripts Node ESM purs.
 */

// ---------- Identité canonique ----------

export const ENTITY = {
  name: 'Judith Dufour-Savard',
  alternateName: 'Judith Dufour-Savard, Ac.',
  jobTitleShort: 'Acupunctrice',
  jobTitleLong: "Acupunctrice membre de l'Ordre des acupuncteurs du Québec",

  websiteName: 'Judith Dufour-Savard — Acupunctrice',
  businessName: 'Judith Dufour-Savard — Acupuncture',
  businessAlternateName: 'Acupuncture Judith',

  oaqNumber: 'A-008-24',
  oaqName: 'Ordre des acupuncteurs du Québec',
  oaqAcronym: 'OAQ',
  oaqUrl: 'https://o-a-q.org',

  diploma: 'DEC en acupuncture',
  diplomaLong: "Diplôme d'études collégiales en acupuncture",
  school: 'Collège de Rosemont',

  wikidataId: 'Q139677208',
  wikidataUrl: 'https://www.wikidata.org/wiki/Q139677208',

  portraitImagePath: '/site/judith/judith-portrait-01.webp',
};

// ---------- Affiliations professionnelles passées ----------
// Mention dans bios + page À propos. PAS dans schema.memberOf (mandats terminés).

export const PAST_AFFILIATIONS = [
  {
    name: 'Association des Acupuncteurs du Québec',
    acronym: 'AAQ',
    role: "Ancienne administratrice du conseil d'administration",
    url: 'https://acupuncture-quebec.com/conseil-d-administration/',
  },
];

// ---------- Spécialités à 3 niveaux ----------

export const PILIERS = [
  {
    id: 'fertilite',
    name: 'Fertilité',
    labelLong: 'Acupuncture en fertilité',
    url: '/services/fertilite',
  },
  {
    id: 'grossesse',
    name: 'Grossesse & périnatalité',
    labelLong: 'Acupuncture en grossesse et périnatalité',
    url: '/services/grossesse',
  },
  {
    id: 'pediatrie',
    name: 'Pédiatrie',
    labelLong: 'Acupuncture pédiatrique',
    url: '/services/pediatrie',
  },
  {
    id: 'sociale',
    name: 'Acupuncture sociale',
    labelLong: 'Acupuncture sociale (tarif réduit)',
    url: '/services/acupuncture-sociale',
  },
];

// Spécialités émergentes — NE PAS exposer dans schema, llms.txt, llms-full.txt
// tant que la page n'est pas publiée. Liste informative seulement.
export const EMERGING_SPECIALTIES = [
  { id: 'menopause', name: 'Ménopause', activated: false },
];

// ---------- NAP des deux cliniques ----------

export const NAP = {
  lssi: {
    name: 'La Source en Soi',
    nameShort: 'LSSI',
    streetAddress: '2554 rue Beaubien Est',
    addressLocality: 'Montréal',
    addressRegion: 'QC',
    postalCode: 'H1Y 1G3',
    addressCountry: 'CA',
    neighborhood: 'Rosemont',
    borough: 'Rosemont—La Petite-Patrie',
    // Géolocalisation tranchée à partir du SOT v1.7. La valeur 45.5501/-73.5832
    // anciennement dans rdvUrl.ts était trop au nord pour la rue Beaubien Est
    // et a été corrigée vers 45.5408/-73.5823.
    geo: { latitude: 45.5408, longitude: -73.5823 },
    daysOfPractice: ['lundi', 'mardi', 'jeudi', 'vendredi'],
    daysLabel: 'lundi, mardi, jeudi, vendredi',
    hasSocialAcupuncture: true,
    services: ['Acupuncture classique', 'Acupuncture sociale'],
    grvSlug: 'lasourceensoi',
    grvCompanyId: '104074',
    grvEmployeeId: '175708',
    grvUrl: 'https://www.gorendezvous.com/lasourceensoi?companyId=104074&eids=175708',
    siteUrl: 'https://lasourceensoi.com/',
    mapsQuery: '2554+rue+Beaubien+Est+Montreal+QC+H1Y+1G3',
  },
  eden: {
    name: 'Éden Yoga Pilates',
    streetAddress: '121 boulevard Industriel',
    addressComplement: 'local 225',
    streetAddressFull: '121 boulevard Industriel, local 225',
    addressLocality: 'Repentigny',
    addressRegion: 'QC',
    postalCode: 'J6A 7K4',
    addressCountry: 'CA',
    geo: { latitude: 45.7422, longitude: -73.4515 },
    daysOfPractice: ['mercredi'],
    daysLabel: 'mercredi, 9 h 00 à 15 h 00',
    hours: '9 h 00 à 15 h 00',
    hasSocialAcupuncture: false,
    services: ['Acupuncture classique'],
    grvSlug: 'edenyogapilates',
    grvCompanyId: '141296',
    grvEmployeeId: '192390',
    grvStype: 'Acupuncture',
    grvUrl: 'https://www.gorendezvous.com/edenyogapilates?companyId=141296&eids=192390&stype=Acupuncture',
    siteUrl: 'https://edenyogapilates.ca/',
    siteUrlAlt: 'https://edensantemieuxetre.com/',
    mapsQuery: 'Eden+Yoga+Pilates+121+boul+Industriel+225+Repentigny+QC',
  },
};

// ---------- Coordonnées canoniques ----------

export const CONTACT = {
  phone: '+1-514-750-3735',          // format E.164 (pour schema.org telephone)
  phoneLocal: '514 750-3735',
  phoneInternational: '+1 514 750-3735',
  email: 'info@acupuncturejudith.ca',
  website: 'https://www.acupuncturejudith.ca',
  websiteNoWww: 'https://acupuncturejudith.ca',
  reservationUrl: 'https://www.gorendezvous.com/lasourceensoi?companyId=104074&eids=175708',
};

// ---------- sameAs et liens externes ----------

export const SAMEAS = {
  // Réseaux sociaux et identifiants — pour Person.sameAs
  social: [
    'https://www.wikidata.org/wiki/Q139677208',
    'https://www.instagram.com/mon_acupunctrice/',
    'https://www.youtube.com/@JudithDufourSavard',
    'https://www.facebook.com/profile.php?id=61562614934143',
    'https://www.linkedin.com/in/judith-dufour-savard-acu/',
  ],
  // Liens business — pour MedicalBusiness.sameAs (en plus de social)
  business: [
    'https://lasourceensoi.com/',
    'https://share.google/ncO1Alzja10AmsUfR',
  ],
  // Profils d'autorité externes — sources qui corroborent l'identité de Judith
  // de façon faisant autorité (ordre professionnel, plateformes santé, page
  // équipe officielle des cliniques où elle pratique). À ajouter au schema
  // sameAs au fur et à mesure que les URLs deviennent vérifiables et stables.
  // En attente : Lumino (Sun Life), GoRendezVous profil public, page équipe
  // LSSI corrigée, vérification HealthDoc, profil OAQ public si disponible.
  authority: [],
  // Lien d'avis court Google Business Profile — Chantier 2 (demandes d'avis patientes)
  gbpReviewLink: 'https://g.page/r/CQt_EeseQ8U_EBM/review',
  gbpShareUrl: 'https://share.google/ncO1Alzja10AmsUfR',
};

// ---------- Tarifs ----------

export const PRICING = {
  adultSession: 100,
  childSession: 90,
  socialMin: 35,
  socialMax: 60,
  currency: 'CAD',
  receiptsForInsurance: true,
};

// ---------- Bios canoniques (3e personne, profils externes) ----------

export const BIOS = {
  short: `Judith Dufour-Savard, Ac., est acupunctrice membre de l'OAQ (A-008-24). Elle pratique à La Source en Soi (Rosemont, Montréal) et à Éden Yoga Pilates (Repentigny). Spécialisée en fertilité, grossesse et périnatalité, pédiatrie et acupuncture sociale. Ancienne accompagnante à la Maison de naissance Côte-des-Neiges.`,

  medium: `Judith Dufour-Savard, Ac., est acupunctrice membre de l'Ordre des acupuncteurs du Québec (A-008-24). Diplômée du DEC en acupuncture du Collège de Rosemont, elle a accompagné de nombreuses familles à la Maison de naissance Côte-des-Neiges pendant ses études — une expérience qui a profondément orienté sa pratique vers la santé des femmes et les transitions de vie.

Elle pratique du lundi au vendredi (sauf le mercredi) à La Source en Soi, 2554 Beaubien Est dans Rosemont à Montréal, et le mercredi à Éden Yoga Pilates à Repentigny. Ses séances durent 60 minutes : le temps d'écouter, d'évaluer, de traiter et d'expliquer.

Ses spécialités : fertilité (incluant FIV et insémination), grossesse et périnatalité (du premier trimestre au post-partum), pédiatrie (techniques douces sans aiguille pour les plus petits) et acupuncture sociale à tarif réduit.`,

  long: `Judith Dufour-Savard, Ac., est acupunctrice membre de l'Ordre des acupuncteurs du Québec (A-008-24). Elle a d'abord eu une première vie dans le spectacle vivant — en régie et en éclairage. C'est l'arrivée de ses enfants qui l'a menée vers la périnatalité, puis vers le DEC en acupuncture au Collège de Rosemont. Pendant ses études, elle a travaillé à la Maison de naissance Côte-des-Neiges, où elle a accompagné de nombreuses familles dans les débuts de la vie. Cette expérience a profondément orienté sa pratique vers la santé des femmes et les transitions de vie.

Aujourd'hui, elle pratique à Rosemont (La Source en Soi, 2554 Beaubien Est) du lundi au vendredi sauf le mercredi, jour où elle reçoit à Éden Yoga Pilates à Repentigny. Ses séances durent 60 minutes : le temps d'écouter, d'évaluer, de traiter et d'expliquer.

Sa pratique se concentre sur quatre piliers. La fertilité, incluant le soutien en FIV, en insémination, et pour des conditions comme le SOPK et l'endométriose. La grossesse et la périnatalité, du premier trimestre au post-partum (nausées, douleurs, préparation à l'accouchement, moxibustion pour bébé en siège). La pédiatrie, avec des techniques adaptées et souvent sans aiguille pour les plus petits (aimants, shōnishin). Et l'acupuncture sociale, des soins à tarif réduit pour rendre la santé accessible.

Au-delà de sa pratique clinique, Judith s'est engagée dans le rayonnement de la profession en siégeant au conseil d'administration de l'Association des Acupuncteurs du Québec (AAQ) à titre d'administratrice. Elle se forme continuellement auprès de professionnels experts dans leur domaine.`,
};
