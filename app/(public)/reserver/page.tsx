import type { Metadata } from 'next';
import Link from 'next/link';
import CtaButton from '../_components/CtaButton';
import CtaBotanicalDeco from '../_components/CtaBotanicalDeco';
import SectionHeading from '../_components/SectionHeading';

export const metadata: Metadata = {
  title: 'Prendre rendez-vous \u2014 Acupuncture Rosemont, Montreal',
  description:
    'Reservez votre seance d\u2019acupuncture a Rosemont en ligne, par telephone ou par courriel. Disponibilites en temps reel via Go Rendez-Vous. Clinique La Source en Soi.',
};

const GRV_URL = 'https://www.gorendezvous.com/lasourceensoi?companyId=104074';

const CONTACT_MODES = [
  {
    title: 'Par t\u00e9l\u00e9phone',
    text: '514 750-3735 \u2014 Appelez La Source en Soi et demandez Judith Dufour-Savard. Message vocal disponible si je suis en s\u00e9ance.',
  },
  {
    // TODO Judith: email a completer (placeholder suggere info@acupuncturejudith.ca)
    title: 'Par courriel',
    text: '[\u00e0 compl\u00e9ter] \u2014 Pour les questions pr\u00e9alables \u00e0 la prise de rendez-vous ou les situations particuli\u00e8res.',
  },
  {
    title: 'En clinique',
    text: '2554 rue Beaubien Est, Montr\u00e9al, QC H1Y 1G3 (Rosemont, m\u00e9tro Beaubien).',
  },
];

const EXPECT = [
  {
    title: 'Dur\u00e9e',
    text: '60 minutes (consultation priv\u00e9e) / 30 \u00e0 45 minutes (acupuncture sociale)',
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

// TODO Judith: horaires exacts a valider (placeholder plausible alimentant Schema.org)
const OPENING_HOURS = [
  { dayOfWeek: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '19:00' },
  { dayOfWeek: 'Saturday', opens: '09:00', closes: '15:00' },
];

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: 'Judith Dufour-Savard \u2014 Acupuncture',
    telephone: '+1-514-750-3735',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '2554 rue Beaubien Est',
      addressLocality: 'Montr\u00e9al',
      addressRegion: 'QC',
      postalCode: 'H1Y 1G3',
      addressCountry: 'CA',
    },
    mainEntityOfPage: { '@id': 'https://acupuncturejudith.ca/#business' },
    openingHoursSpecification: OPENING_HOURS.map((h) => ({ '@type': 'OpeningHoursSpecification', ...h })),
    potentialAction: {
      '@type': 'ReserveAction',
      target: GRV_URL,
      result: { '@type': 'Reservation', name: 'S\u00e9ance d\u2019acupuncture' },
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://acupuncturejudith.ca/' },
      { '@type': 'ListItem', position: 2, name: 'R\u00e9server', item: 'https://acupuncturejudith.ca/reserver' },
    ],
  },
];

export default function ReserverPage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      {/* Hero */}
      <section className="bg-gradient-to-b from-public-beige-bg to-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
        <div className="max-w-[860px] mx-auto text-center">
          <SectionHeading
            kicker="R&Eacute;SERVER"
            title="Prendre rendez-vous."
            subtitle="Trois fa&ccedil;ons de r&eacute;server votre s&eacute;ance d&rsquo;acupuncture &agrave; Rosemont. Choisissez celle qui vous convient."
          />
        </div>
      </section>

      {/* Option principale : en ligne */}
      <section className="bg-white py-[68px] md:py-[88px] px-5 md:px-8">
        <div className="max-w-[780px] mx-auto text-center">
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[2.5px] text-public-accent-taupe-dark mb-3">
            RECOMMAND&Eacute;
          </span>
          <h2 className="font-public-serif text-[32px] md:text-[40px] font-medium text-public-text-dark mb-6">
            En ligne
          </h2>
          <p className="text-[17px] leading-relaxed text-public-text-medium mb-8">
            Le syst&egrave;me de r&eacute;servation <strong>Go Rendez-Vous</strong> vous permet de voir
            mes disponibilit&eacute;s en temps r&eacute;el et de r&eacute;server directement. Vous recevez
            un courriel de confirmation imm&eacute;diat et un rappel 24h avant votre s&eacute;ance.
          </p>
          <a
            href={GRV_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-public-accent-taupe text-white rounded-md font-semibold uppercase px-11 py-[18px] text-sm tracking-[1px] transition-all duration-200 hover:bg-public-accent-taupe-dark hover:-translate-y-px hover:shadow-public-md"
          >
            Voir les disponibilit&eacute;s &rarr;
          </a>
          {/* TODO Judith: lien direct vers profil Judith sur GRV (employeeId 7556837) a confirmer */}
          <p className="mt-6 text-[13px] text-public-text-light max-w-[540px] mx-auto">
            Sur Go Rendez-Vous, s&eacute;lectionnez la clinique <strong>La Source en Soi</strong> puis <strong>Judith Dufour-Savard</strong>.
          </p>
        </div>
      </section>

      {/* Autres moyens */}
      <section className="bg-public-beige-bg py-[68px] md:py-[88px] px-5 md:px-8">
        <div className="max-w-[1080px] mx-auto">
          <SectionHeading kicker="AUTREMENT" title="Autres moyens de r&eacute;server." />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {CONTACT_MODES.map((mode) => (
              <div key={mode.title} className="bg-white rounded-[14px] p-6 border border-public-border-subtle">
                <h3 className="font-public-serif text-[20px] font-semibold mb-2 text-public-text-dark">{mode.title}</h3>
                <p className="text-[14px] text-public-text-medium leading-relaxed">{mode.text}</p>
              </div>
            ))}
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

      {/* Horaires */}
      <section className="bg-public-beige-light py-[68px] md:py-[88px] px-5 md:px-8">
        <div className="max-w-[620px] mx-auto text-center">
          <SectionHeading kicker="HORAIRES" title="Horaires de consultation." />
          {/* TODO Judith: horaires exacts a valider. Placeholder plausible alimentant Schema.org. */}
          <dl className="mt-10 space-y-2 text-[16px] text-public-text-medium">
            <div className="flex justify-between gap-4 py-2 border-b border-public-border-subtle">
              <dt>Mardi au vendredi</dt>
              <dd>9 h &ndash; 19 h</dd>
            </div>
            <div className="flex justify-between gap-4 py-2 border-b border-public-border-subtle">
              <dt>Samedi</dt>
              <dd>9 h &ndash; 15 h</dd>
            </div>
            <div className="flex justify-between gap-4 py-2 text-public-text-light">
              <dt>Lundi et dimanche</dt>
              <dd>Ferm&eacute;</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-gradient-to-b from-public-accent-taupe to-public-accent-taupe-dark text-white py-[68px] md:py-[88px] px-5 md:px-8 text-center relative overflow-hidden">
        <CtaBotanicalDeco />
        <div className="max-w-[620px] mx-auto relative z-10">
          <h2 className="font-public-serif text-[28px] md:text-[40px] font-medium mb-4">Pr&ecirc;te ?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4 items-center mt-4">
            <CtaButton variant="white" size="lg" href={GRV_URL}>R&eacute;server maintenant</CtaButton>
            <Link href="/tarifs" className="text-white/80 hover:text-white underline underline-offset-4 text-[14px]">
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
