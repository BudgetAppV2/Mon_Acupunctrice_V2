// URLs de reservation directes vers le profil de Judith dans chaque clinique
//
// 📌 Source canonique de NAP / contact : `lib/entity-canonical.mjs`
//    Toute mise à jour d'adresse, téléphone, géo, ou URL GoRendezVous
//    se fait là-bas et est répercutée automatiquement ici.
// 📌 Documentation primaire : `project-docs/02_ROADMAP/content-strategy/ENTITY_SOURCE_OF_TRUTH.md`

import { NAP, CONTACT } from '@/lib/entity-canonical.mjs';

export type Clinic = 'lssi' | 'eden';

type Platform = 'instagram' | 'facebook' | 'youtube' | 'blog' | 'story' | 'bio';
type Medium = 'reel' | 'caption' | 'article' | 'story' | 'description' | 'link';

// Pour les valeurs UI (jours capitalisés, format affiché à l'utilisateur),
// on les construit à partir des données canoniques (lowercase, anglicisée)
// + un peu de mise en forme. Cela évite la divergence tout en respectant
// les conventions d'affichage du site.
function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const CLINICS = {
  lssi: {
    name: NAP.lssi.name,
    shortName: NAP.lssi.neighborhood,
    address: `${NAP.lssi.streetAddress}, ${NAP.lssi.addressLocality}, ${NAP.lssi.addressRegion} ${NAP.lssi.postalCode}`,
    addressShort: NAP.lssi.streetAddress,
    city: NAP.lssi.addressLocality,
    region: NAP.lssi.borough,
    phone: CONTACT.phoneLocal,
    phoneFull: CONTACT.phone,
    siteUrl: NAP.lssi.siteUrl,
    grvSlug: NAP.lssi.grvSlug,
    grvUrl: NAP.lssi.grvUrl,
    mapsQuery: NAP.lssi.mapsQuery,
    days: capitalizeFirst(NAP.lssi.daysLabel),
    services: [...NAP.lssi.services],
    hasSociale: NAP.lssi.hasSocialAcupuncture,
    postalCode: NAP.lssi.postalCode,
    // Géolocalisation : valeur tranchée à 45.5408/-73.5823 dans entity-canonical
    // (la valeur 45.5501/-73.5832 anciennement ici a été corrigée — cf. SOT v1.7).
    geo: NAP.lssi.geo,
  },
  eden: {
    name: NAP.eden.name,
    shortName: NAP.eden.addressLocality,
    address: `${NAP.eden.streetAddressFull}, ${NAP.eden.addressLocality}, ${NAP.eden.addressRegion} ${NAP.eden.postalCode}`,
    addressShort: NAP.eden.streetAddressFull,
    city: NAP.eden.addressLocality,
    region: NAP.eden.addressLocality,
    phone: '',
    phoneFull: '',
    siteUrl: NAP.eden.siteUrl,
    grvSlug: NAP.eden.grvSlug,
    grvUrl: NAP.eden.grvUrl,
    mapsQuery: NAP.eden.mapsQuery,
    days: capitalizeFirst(NAP.eden.daysLabel),
    services: [...NAP.eden.services],
    hasSociale: NAP.eden.hasSocialAcupuncture,
    postalCode: NAP.eden.postalCode,
    geo: NAP.eden.geo,
  },
};

export function getRdvUrl(opts?: {
  source?: Platform;
  medium?: Medium;
  campaign?: string;
  clinic?: Clinic;
}): string {
  const clinic = opts?.clinic || 'lssi';
  const base = CLINICS[clinic].grvUrl;
  if (!opts?.source) return base;
  const params = new URLSearchParams();
  params.set('utm_source', opts.source);
  if (opts.medium) params.set('utm_medium', opts.medium);
  if (opts.campaign) params.set('utm_campaign', opts.campaign);
  return `${base}&${params.toString()}`;
}

export function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
}

// For story images (text in image, not clickable — redirige vers la page /reserver)
export const RDV_URL_SHORT = 'acupuncturejudith.ca/reserver';
export const RDV_URL_BASE = CLINICS.lssi.grvUrl;
