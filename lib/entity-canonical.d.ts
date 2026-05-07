/**
 * entity-canonical.d.ts — Types TypeScript pour `entity-canonical.mjs`
 *
 * Ce fichier est consommé automatiquement par TypeScript quand un .ts/.tsx
 * fait `import { ENTITY, NAP, ... } from '@/lib/entity-canonical.mjs'`.
 * Aucun runtime impact — purement typage.
 */

export interface Entity {
  readonly name: string;
  readonly alternateName: string;
  readonly jobTitleShort: string;
  readonly jobTitleLong: string;
  readonly websiteName: string;
  readonly businessName: string;
  readonly businessAlternateName: string;
  readonly oaqNumber: string;
  readonly oaqName: string;
  readonly oaqAcronym: string;
  readonly oaqUrl: string;
  readonly diploma: string;
  readonly diplomaLong: string;
  readonly school: string;
  readonly wikidataId: string;
  readonly wikidataUrl: string;
  readonly portraitImagePath: string;
}

export interface PastAffiliation {
  readonly name: string;
  readonly acronym: string;
  readonly role: string;
  readonly url: string;
}

export interface Pilier {
  readonly id: string;
  readonly name: string;
  readonly labelLong: string;
  readonly url: string;
}

export interface EmergingSpecialty {
  readonly id: string;
  readonly name: string;
  readonly activated: boolean;
}

export interface Geo {
  readonly latitude: number;
  readonly longitude: number;
}

export interface Clinic {
  readonly name: string;
  readonly nameShort?: string;
  readonly streetAddress: string;
  readonly addressComplement?: string;
  readonly streetAddressFull?: string;
  readonly addressLocality: string;
  readonly addressRegion: string;
  readonly postalCode: string;
  readonly addressCountry: string;
  readonly neighborhood?: string;
  readonly borough?: string;
  readonly geo: Geo;
  readonly daysOfPractice: readonly string[];
  readonly daysLabel: string;
  readonly hours?: string;
  readonly hasSocialAcupuncture: boolean;
  readonly services: readonly string[];
  readonly grvSlug: string;
  readonly grvCompanyId: string;
  readonly grvEmployeeId: string;
  readonly grvStype?: string;
  readonly grvUrl: string;
  readonly siteUrl: string;
  readonly siteUrlAlt?: string;
  readonly mapsQuery: string;
}

export interface NapMap {
  readonly lssi: Clinic;
  readonly eden: Clinic;
}

export interface Contact {
  readonly phone: string;
  readonly phoneLocal: string;
  readonly phoneInternational: string;
  readonly email: string;
  readonly website: string;
  readonly websiteNoWww: string;
  readonly reservationUrl: string;
}

export interface SameAs {
  readonly social: readonly string[];
  readonly business: readonly string[];
  readonly gbpReviewLink: string;
  readonly gbpShareUrl: string;
}

export interface Bios {
  readonly short: string;
  readonly medium: string;
  readonly long: string;
}

export interface Pricing {
  readonly adultSession: number;
  readonly childSession: number;
  readonly socialMin: number;
  readonly socialMax: number;
  readonly currency: string;
  readonly receiptsForInsurance: boolean;
}

export const ENTITY: Entity;
export const PAST_AFFILIATIONS: readonly PastAffiliation[];
export const PILIERS: readonly Pilier[];
export const EMERGING_SPECIALTIES: readonly EmergingSpecialty[];
export const NAP: NapMap;
export const CONTACT: Contact;
export const SAMEAS: SameAs;
export const BIOS: Bios;
export const PRICING: Pricing;
