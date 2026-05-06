import type { Metadata } from 'next';
import Link from 'next/link';
import { CLINICS } from '@/lib/utils/rdvUrl';
import CtaButton from '../_components/CtaButton';
import CtaBotanicalDeco from '../_components/CtaBotanicalDeco';
import SectionHeading from '../_components/SectionHeading';
import TrackedLink from '../_components/TrackedLink';
import Reveal from '../_components/animations/Reveal';

export const metadata: Metadata = {
  title: 'Contact — Acupuncture Rosemont et Repentigny',
  description:
    'Contactez Judith Dufour-Savard, acupunctrice \u00e0 Rosemont (La Source en Soi) et Repentigny (\u00c9den Yoga Pilates). Par t\u00e9l\u00e9phone, courriel ou en personne.',
};

// TODO Judith: email a completer (placeholder suggere info@acupuncturejudith.ca)
const CONTACT_EMAIL = 'info@acupuncturejudith.ca';

const MAPS_LSSI_EMBED = `https://www.google.com/maps?q=${CLINICS.lssi.mapsQuery}&output=embed`;
const MAPS_LSSI_DIR = `https://maps.google.com/?daddr=${CLINICS.lssi.mapsQuery}`;
const MAPS_EDEN_EMBED = `https://www.google.com/maps?q=${CLINICS.eden.mapsQuery}&output=embed`;
const MAPS_EDEN_DIR = `https://maps.google.com/?daddr=${CLINICS.eden.mapsQuery}`;

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    mainEntity: { '@id': 'https://www.acupuncturejudith.ca/#business' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.acupuncturejudith.ca/' },
      { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://www.acupuncturejudith.ca/contact' },
    ],
  },
];

export default function ContactPage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      {/* Hero */}
      <section className="bg-gradient-to-b from-public-beige-bg to-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
        <div className="max-w-[860px] mx-auto text-center">
          <Reveal>
            <SectionHeading
              as="h1"
              kicker="CONTACT"
              title="Restons en contact."
              subtitle="Une question avant de r&eacute;server ? Besoin de savoir si l&rsquo;acupuncture est adapt&eacute;e &agrave; votre situation ? &Eacute;crivez-moi ou appelez la clinique &mdash; je vous r&eacute;ponds avec plaisir."
            />
          </Reveal>
        </div>
      </section>

      {/* Deux cliniques */}
      <section className="bg-white py-[68px] md:py-[88px] px-5 md:px-8">
        <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LSSI */}
          <div className="bg-public-beige-light rounded-[14px] p-8 md:p-10 border border-public-border-subtle">
            <h2 className="font-public-serif text-[28px] md:text-[32px] font-medium text-public-text-dark mb-2">
              {CLINICS.lssi.name}
            </h2>
            <p className="text-[16px] text-public-text-medium leading-relaxed mb-6">
              {CLINICS.lssi.addressShort}<br />
              Montr&eacute;al, QC &nbsp; {CLINICS.lssi.postalCode}
            </p>
            <dl className="space-y-3 text-[15px] text-public-text-medium">
              <div className="flex items-start gap-3">
                <PhoneIcon />
                <span><strong>T&eacute;l&eacute;phone</strong> : <TrackedLink href={`tel:${CLINICS.lssi.phoneFull}`} event="Contact telephone" className="underline underline-offset-2 hover:text-public-accent-warm">{CLINICS.lssi.phone}</TrackedLink></span>
              </div>
              <div className="flex items-start gap-3">
                <MailIcon />
                <span><strong>Courriel</strong> : <TrackedLink href={`mailto:${CONTACT_EMAIL}`} event="Contact courriel" className="underline underline-offset-2 hover:text-public-accent-warm">{CONTACT_EMAIL}</TrackedLink></span>
              </div>
              <div className="flex items-start gap-3">
                <GlobeIcon />
                <span><strong>Site clinique</strong> : <a href={CLINICS.lssi.siteUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-public-accent-warm">lasourceensoi.com</a></span>
              </div>
              <div className="flex items-start gap-3">
                <CalendarIcon />
                <span><strong>Jours</strong> : {CLINICS.lssi.days}</span>
              </div>
              <div className="flex items-start gap-3">
                <PinIcon />
                <span>M&eacute;tro Beaubien (ligne orange) &mdash; 10 minutes &agrave; pied. Stationnement sur rue.</span>
              </div>
            </dl>
            <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-public-border-subtle text-[13px] font-medium text-public-text-dark">
              <StarIcon />
              4,9/5 sur 1 215 avis Google
            </div>
            <div className="mt-6">
              <CtaButton variant="primary" size="lg" href={CLINICS.lssi.grvUrl}>R&eacute;server &agrave; Rosemont</CtaButton>
            </div>
          </div>

          {/* Eden */}
          <div className="bg-public-beige-light rounded-[14px] p-8 md:p-10 border border-public-border-subtle">
            <h2 className="font-public-serif text-[28px] md:text-[32px] font-medium text-public-text-dark mb-2">
              {CLINICS.eden.name}
            </h2>
            <p className="text-[16px] text-public-text-medium leading-relaxed mb-6">
              {CLINICS.eden.addressShort}<br />
              Repentigny, QC
            </p>
            <dl className="space-y-3 text-[15px] text-public-text-medium">
              <div className="flex items-start gap-3">
                <CalendarIcon />
                <span><strong>Jour</strong> : {CLINICS.eden.days}</span>
              </div>
              <div className="flex items-start gap-3">
                <ClockIcon />
                <span><strong>Dernier patient</strong> : 14 h</span>
              </div>
              <div className="flex items-start gap-3">
                <GlobeIcon />
                <span><strong>Site clinique</strong> : <a href={CLINICS.eden.siteUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-public-accent-warm">edenyogapilates.ca</a></span>
              </div>
              <div className="flex items-start gap-3">
                <PinIcon />
                <span>Stationnement gratuit sur place.</span>
              </div>
            </dl>
            <div className="mt-6">
              <CtaButton variant="primary" size="lg" href={CLINICS.eden.grvUrl}>R&eacute;server &agrave; Repentigny</CtaButton>
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps — Deux cartes */}
      <section className="bg-public-beige-bg py-[68px] md:py-[88px] px-5 md:px-8">
        <div className="max-w-[1080px] mx-auto">
          <SectionHeading kicker="ACC&Egrave;S" title="Se rendre aux cliniques." align="left" />
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-public-serif text-[18px] font-semibold text-public-text-dark mb-3">Rosemont &mdash; La Source en Soi</h3>
              <iframe
                src={MAPS_LSSI_EMBED}
                width="100%" height={300} style={{ border: 0 }} loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Carte Google Maps — La Source en Soi"
                className="rounded-[14px] shadow-public-sm w-full"
              />
              <a href={MAPS_LSSI_DIR} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-[14px] font-medium text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft">
                Itin&eacute;raire &rarr;
              </a>
            </div>
            <div>
              <h3 className="font-public-serif text-[18px] font-semibold text-public-text-dark mb-3">Repentigny &mdash; &Eacute;den Yoga Pilates</h3>
              <iframe
                src={MAPS_EDEN_EMBED}
                width="100%" height={300} style={{ border: 0 }} loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Carte Google Maps — &Eacute;den Yoga Pilates"
                className="rounded-[14px] shadow-public-sm w-full"
              />
              <a href={MAPS_EDEN_DIR} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-[14px] font-medium text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft">
                Itin&eacute;raire &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Ecrivez-moi */}
      <section className="bg-white py-[68px] md:py-[88px] px-5 md:px-8">
        <div className="max-w-[720px] mx-auto text-center">
          <SectionHeading kicker="&Eacute;CRIVEZ-MOI" title="Une question ? &Eacute;crivez-moi." />
          <p className="mt-8 text-[17px] leading-relaxed text-public-text-medium mb-8">
            Pour toute question avant de r&eacute;server &mdash; nature de vos sympt&ocirc;mes, compatibilit&eacute;
            avec votre suivi m&eacute;dical, accessibilit&eacute; de l&rsquo;acupuncture sociale &mdash; &eacute;crivez-moi.
            Je r&eacute;ponds habituellement dans les 48 heures ouvrables.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Question pour Judith')}`}
            className="inline-flex items-center gap-2 bg-public-accent-taupe text-white rounded-md font-semibold uppercase px-11 py-[18px] text-sm tracking-[1px] transition-all duration-200 hover:bg-public-accent-taupe-dark hover:-translate-y-px hover:shadow-public-md"
          >
            &Eacute;crivez-moi
          </a>
          <p className="mt-6 text-[13px] text-public-text-light">
            Pour r&eacute;server une s&eacute;ance, utilisez plut&ocirc;t le{' '}
            <Link href="/reserver" className="text-public-accent-warm underline underline-offset-2">formulaire en ligne</Link>.
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-gradient-to-b from-public-accent-taupe to-public-accent-taupe-dark text-white py-[68px] md:py-[88px] px-5 md:px-8 text-center relative overflow-hidden">
        <CtaBotanicalDeco />
        <div className="max-w-[680px] mx-auto relative z-10">
          <h2 className="font-public-serif text-[28px] md:text-[40px] font-medium mb-6">
            Pr&ecirc;te &agrave; franchir le pas ?
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
            <CtaButton variant="white" size="lg" href="/reserver">Prendre rendez-vous</CtaButton>
            <Link href="/tarifs" className="text-white/80 hover:text-white underline underline-offset-4 text-[14px]">Voir les tarifs</Link>
            <Link href="/services/fertilite" className="text-white/80 hover:text-white underline underline-offset-4 text-[14px]">Mes services</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="w-5 h-5 text-public-accent-warm shrink-0 mt-0.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="w-5 h-5 text-public-accent-warm shrink-0 mt-0.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="w-5 h-5 text-public-accent-warm shrink-0 mt-0.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="w-5 h-5 text-public-accent-warm shrink-0 mt-0.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-public-accent-warm">
      <path fillRule="evenodd" clipRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354l-4.627 2.828c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.006Z" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="w-5 h-5 text-public-accent-warm shrink-0 mt-0.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" className="w-5 h-5 text-public-accent-warm shrink-0 mt-0.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
