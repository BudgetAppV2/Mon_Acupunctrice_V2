import type { Metadata } from 'next';
import Link from 'next/link';
import { CLINICS } from '@/lib/utils/rdvUrl';
import CtaButton from '../_components/CtaButton';
import CtaBotanicalDeco from '../_components/CtaBotanicalDeco';
import TrackedLink from '../_components/TrackedLink';
import SectionHeading from '../_components/SectionHeading';
import Reveal from '../_components/animations/Reveal';

export const metadata: Metadata = {
  title: 'Prendre rendez-vous — Acupuncture Rosemont et Repentigny',
  description:
    'R\u00e9servez votre s\u00e9ance d\u2019acupuncture \u00e0 Rosemont (La Source en Soi) ou \u00e0 Repentigny (\u00c9den Yoga Pilates). Disponibilit\u00e9s en temps r\u00e9el via Go Rendez-Vous.',
};

// TODO Judith: email a completer (placeholder suggere info@acupuncturejudith.ca)
const CONTACT_EMAIL = 'info@acupuncturejudith.ca';

const EXPECT = [
  {
    title: 'Dur\u00e9e',
    text: '60 minutes (consultation priv\u00e9e) / 30 \u00e0 45 minutes (acupuncture sociale, Rosemont seulement)',
  },
  {
    title: 'Tenue',
    text: 'Portez des v\u00eatements confortables qui se retroussent au niveau des coudes et des genoux. Vous n\u2019aurez pas \u00e0 vous d\u00e9v\u00eatir.',
  },
  {
    title: '\u00c0 apporter',
    text: 'Si vous avez des r\u00e9sultats d\u2019examens m\u00e9dicaux r\u00e9cents (bilans sanguins, imagerie, suivi de fertilit\u00e9), apportez-les. Sinon, rien de particulier.',
  },
];

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: 'Judith Dufour-Savard \u2014 Acupuncture',
    telephone: CLINICS.lssi.phoneFull,
    location: [
      {
        '@type': 'Place',
        name: CLINICS.lssi.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: '2554 rue Beaubien Est',
          addressLocality: 'Montr\u00e9al',
          addressRegion: 'QC',
          postalCode: 'H1Y 1G3',
          addressCountry: 'CA',
        },
      },
      {
        '@type': 'Place',
        name: CLINICS.eden.name,
        address: {
          '@type': 'PostalAddress',
          streetAddress: '121 boul. Industriel #225',
          addressLocality: 'Repentigny',
          addressRegion: 'QC',
          addressCountry: 'CA',
        },
      },
    ],
    mainEntityOfPage: { '@id': 'https://www.acupuncturejudith.ca/#business' },
    potentialAction: [
      {
        '@type': 'ReserveAction',
        target: CLINICS.lssi.grvUrl,
        result: { '@type': 'Reservation', name: 'S\u00e9ance d\u2019acupuncture \u2014 Rosemont' },
      },
      {
        '@type': 'ReserveAction',
        target: CLINICS.eden.grvUrl,
        result: { '@type': 'Reservation', name: 'S\u00e9ance d\u2019acupuncture \u2014 Repentigny' },
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://www.acupuncturejudith.ca/' },
      { '@type': 'ListItem', position: 2, name: 'R\u00e9server', item: 'https://www.acupuncturejudith.ca/reserver' },
    ],
  },
];

export default function ReserverPage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      {/* Hero */}
      <section className="bg-gradient-to-b from-public-beige-bg to-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8 relative overflow-hidden">
        <div className="absolute -left-[100px] top-[10px] w-[380px] h-[460px] pointer-events-none z-0 hidden lg:block" aria-hidden="true" style={{ transform: 'rotate(-8deg)', opacity: 0.12, mixBlendMode: 'multiply' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/site/svg/hands-lotus.svg" alt="" loading="lazy" className="w-full h-full object-contain" />
        </div>
        <div className="max-w-[860px] mx-auto text-center relative z-10">
          <Reveal>
            <SectionHeading
              as="h1"
              kicker="R&Eacute;SERVER"
              title="Prendre rendez-vous."
              subtitle="Je pratique &agrave; deux cliniques. Choisissez celle qui vous convient et r&eacute;servez en ligne &mdash; disponibilit&eacute;s en temps r&eacute;el."
            />
          </Reveal>
        </div>
      </section>

      {/* Deux cliniques */}
      <section className="bg-white py-[68px] md:py-[88px] px-5 md:px-8">
        <div className="max-w-[1080px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* La Source en Soi */}
            <div className="bg-public-beige-light rounded-[14px] p-8 border border-public-border-subtle flex flex-col">
              <span className="inline-block text-[11px] font-semibold uppercase tracking-[2.5px] text-public-accent-taupe-dark mb-2">
                ROSEMONT &mdash; MONTR&Eacute;AL
              </span>
              <h2 className="font-public-serif text-[26px] md:text-[30px] font-medium text-public-text-dark mb-1">
                {CLINICS.lssi.name}
              </h2>
              <p className="text-[14px] text-public-text-medium mb-4">{CLINICS.lssi.addressShort}, Montr&eacute;al</p>

              <dl className="space-y-2 text-[14px] text-public-text-medium mb-6">
                <div className="flex gap-2"><dt className="font-semibold shrink-0">Jours :</dt><dd>{CLINICS.lssi.days}</dd></div>
                <div className="flex gap-2"><dt className="font-semibold shrink-0">Services :</dt><dd>Acupuncture classique + sociale</dd></div>
                <div className="flex gap-2"><dt className="font-semibold shrink-0">T&eacute;l. :</dt><dd><a href={`tel:${CLINICS.lssi.phoneFull}`} className="underline underline-offset-2 hover:text-public-accent-warm">{CLINICS.lssi.phone}</a></dd></div>
              </dl>

              <div className="mt-auto">
                <TrackedLink
                  href={CLINICS.lssi.grvUrl}
                  event="Reservation Rosemont"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-public-accent-taupe text-white rounded-md font-semibold uppercase px-8 py-[16px] text-sm tracking-[1px] transition-all duration-200 hover:bg-public-accent-taupe-dark hover:-translate-y-px hover:shadow-public-md w-full justify-center"
                >
                  R&eacute;server &agrave; Rosemont &rarr;
                </TrackedLink>
              </div>
            </div>

            {/* Eden Yoga Pilates */}
            <div className="bg-public-beige-light rounded-[14px] p-8 border border-public-border-subtle flex flex-col">
              <span className="inline-block text-[11px] font-semibold uppercase tracking-[2.5px] text-public-accent-taupe-dark mb-2">
                REPENTIGNY
              </span>
              <h2 className="font-public-serif text-[26px] md:text-[30px] font-medium text-public-text-dark mb-1">
                {CLINICS.eden.name}
              </h2>
              <p className="text-[14px] text-public-text-medium mb-4">{CLINICS.eden.addressShort}, Repentigny</p>

              <dl className="space-y-2 text-[14px] text-public-text-medium mb-6">
                <div className="flex gap-2"><dt className="font-semibold shrink-0">Jour :</dt><dd>{CLINICS.eden.days}</dd></div>
                <div className="flex gap-2"><dt className="font-semibold shrink-0">Services :</dt><dd>Acupuncture classique</dd></div>
                <div className="flex gap-2"><dt className="font-semibold shrink-0">Dernier patient :</dt><dd>14 h</dd></div>
              </dl>

              <div className="mt-auto">
                <TrackedLink
                  href={CLINICS.eden.grvUrl}
                  event="Reservation Repentigny"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-public-accent-taupe text-white rounded-md font-semibold uppercase px-8 py-[16px] text-sm tracking-[1px] transition-all duration-200 hover:bg-public-accent-taupe-dark hover:-translate-y-px hover:shadow-public-md w-full justify-center"
                >
                  R&eacute;server &agrave; Repentigny &rarr;
                </TrackedLink>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-[13px] text-public-text-light">
            Les deux syst&egrave;mes <strong>Go Rendez-Vous</strong> affichent les disponibilit&eacute;s
            en temps r&eacute;el. Vous recevez un courriel de confirmation imm&eacute;diat.
          </p>
        </div>
      </section>

      {/* Autres moyens */}
      <section className="bg-public-beige-bg py-[68px] md:py-[88px] px-5 md:px-8">
        <div className="max-w-[1080px] mx-auto">
          <SectionHeading kicker="AUTREMENT" title="Autres moyens de r&eacute;server." />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-[14px] p-6 border border-public-border-subtle">
              <h3 className="font-public-serif text-[20px] font-semibold mb-2 text-public-text-dark">Par t&eacute;l&eacute;phone</h3>
              <p className="text-[14px] text-public-text-medium leading-relaxed">
                {CLINICS.lssi.phone} &mdash; Appelez La Source en Soi et demandez Judith Dufour-Savard.
                Message vocal disponible si je suis en s&eacute;ance.
              </p>
            </div>
            <div className="bg-white rounded-[14px] p-6 border border-public-border-subtle">
              <h3 className="font-public-serif text-[20px] font-semibold mb-2 text-public-text-dark">Par courriel</h3>
              <p className="text-[14px] text-public-text-medium leading-relaxed">
                <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2 hover:text-public-accent-warm">{CONTACT_EMAIL}</a> &mdash;
                Pour les questions pr&eacute;alables &agrave; la prise de rendez-vous ou les situations particuli&egrave;res.
              </p>
            </div>
            <div className="bg-white rounded-[14px] p-6 border border-public-border-subtle">
              <h3 className="font-public-serif text-[20px] font-semibold mb-2 text-public-text-dark">En clinique</h3>
              <p className="text-[14px] text-public-text-medium leading-relaxed">
                Rosemont : {CLINICS.lssi.addressShort} (m&eacute;tro Beaubien).<br />
                Repentigny : {CLINICS.eden.addressShort}.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ce a quoi s'attendre */}
      <section className="bg-white py-[68px] md:py-[88px] px-5 md:px-8">
        <div className="max-w-[780px] mx-auto">
          <SectionHeading kicker="PR&Eacute;PARATION" title="Avant votre premi&egrave;re s&eacute;ance." align="left" />
          <p className="mt-8 text-[17px] leading-relaxed text-public-text-medium mb-8">
            Une premi&egrave;re rencontre en acupuncture, c&rsquo;est un moment d&rsquo;&eacute;change, pas
            un examen m&eacute;dical froid. Voici ce qu&rsquo;il faut savoir.
          </p>
          <ul className="space-y-5">
            {EXPECT.map((e) => (
              <li key={e.title} className="flex gap-4 bg-public-beige-light rounded-[12px] p-5 border border-public-border-subtle">
                <div className="font-public-serif text-[18px] font-semibold text-public-accent-warm shrink-0 w-28">{e.title}</div>
                <p className="text-[15px] text-public-text-medium leading-relaxed">{e.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-gradient-to-b from-public-accent-taupe to-public-accent-taupe-dark text-white py-[68px] md:py-[88px] px-5 md:px-8 text-center relative overflow-hidden">
        <CtaBotanicalDeco />
        <div className="max-w-[620px] mx-auto relative z-10">
          <h2 className="font-public-serif text-[28px] md:text-[40px] font-medium mb-4">Pr&ecirc;te ?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4 items-center mt-4">
            <CtaButton variant="white" size="lg" href={CLINICS.lssi.grvUrl}>Rosemont</CtaButton>
            <CtaButton variant="white" size="lg" href={CLINICS.eden.grvUrl}>Repentigny</CtaButton>
          </div>
          <Link href="/tarifs" className="mt-6 inline-block text-white/80 hover:text-white underline underline-offset-4 text-[14px]">
            Voir les tarifs
          </Link>
        </div>
      </section>
    </main>
  );
}
