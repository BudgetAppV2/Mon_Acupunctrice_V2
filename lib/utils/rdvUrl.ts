// URLs de reservation directes vers le profil de Judith dans chaque clinique
export type Clinic = 'lssi' | 'eden';

type Platform = 'instagram' | 'facebook' | 'youtube' | 'blog' | 'story' | 'bio';
type Medium = 'reel' | 'caption' | 'article' | 'story' | 'description' | 'link';

export const CLINICS = {
  lssi: {
    name: 'La Source en Soi',
    shortName: 'Rosemont',
    address: '2554 rue Beaubien Est, Montr\u00e9al, QC H1Y 1G3',
    addressShort: '2554 rue Beaubien Est',
    city: 'Montr\u00e9al',
    region: 'Rosemont\u2013La Petite-Patrie',
    phone: '514 750-3735',
    phoneFull: '+1-514-750-3735',
    siteUrl: 'https://lasourceensoi.com/',
    grvSlug: 'lasourceensoi',
    grvUrl: 'https://www.gorendezvous.com/lasourceensoi?companyId=104074&eids=175708',
    mapsQuery: '2554+rue+Beaubien+Est+Montreal+QC+H1Y+1G3',
    days: 'Lundi, mardi, jeudi, vendredi',
    services: ['Acupuncture classique', 'Acupuncture sociale'],
    hasSociale: true,
    postalCode: 'H1Y 1G3',
    geo: { latitude: 45.5501, longitude: -73.5832 },
  },
  eden: {
    name: '\u00c9den Yoga Pilates',
    shortName: 'Repentigny',
    address: '121 boul. Industriel #225, Repentigny, QC',
    addressShort: '121 boul. Industriel #225',
    city: 'Repentigny',
    region: 'Repentigny',
    phone: '',
    phoneFull: '',
    siteUrl: 'https://edenyogapilates.ca/',
    grvSlug: 'edenyogapilates',
    grvUrl: 'https://www.gorendezvous.com/edenyogapilates?companyId=141296&eids=192390&stype=Acupuncture',
    mapsQuery: 'Eden+Yoga+Pilates+121+boul+Industriel+225+Repentigny+QC',
    days: 'Mercredi, 9 h \u2013 15 h',
    services: ['Acupuncture classique'],
    hasSociale: false,
    postalCode: '',
    geo: { latitude: 45.7422, longitude: -73.4515 },
  },
} as const;

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
