'use client';

import Reveal from '../_components/animations/Reveal';
import GrainOverlay from '../_components/GrainOverlay';
import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';
import { CLINICS } from '@/lib/utils/rdvUrl';

export default function AboutCliniqueSection() {
  return (
    <GrainOverlay className="bg-public-beige-bg py-[68px] md:py-[104px] px-5 md:px-8 border-t border-b border-public-accent-warm/20">
      <div className="max-w-[1080px] mx-auto">
        <SectionNumber number="03" />
        <SectionHeading kicker="O&Ugrave; JE PRATIQUE" title="Deux lieux, une m&ecirc;me pr&eacute;sence." />

        <div className="max-w-[680px] mx-auto text-center mt-8 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
          <p>
            Mon cabinet principal est chez <strong className="text-public-text-dark">{CLINICS.lesvagues.name}</strong>,
            sur Beaubien Est &agrave; Rosemont. C&rsquo;est l&agrave; que je re&ccedil;ois en consultation priv&eacute;e
            et que j&rsquo;offre l&rsquo;acupuncture sociale, plusieurs fois par semaine.
          </p>
          <p>
            Le jeudi, je pratique &agrave; <strong className="text-public-text-dark">{CLINICS.eden.name}</strong>,
            &agrave; Repentigny. Un studio chaleureux qui me permet d&rsquo;accueillir aussi les patientes
            de la rive nord, dans un environnement d&eacute;di&eacute; au mouvement et au bien-&ecirc;tre.
          </p>
          <p>
            Ce ne sont pas des cliniques corporatives. Ce sont des lieux de soin port&eacute;s par des
            valeurs humaines, ancr&eacute;s dans leurs communaut&eacute;s. Des endroits o&ugrave; on prend le temps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-[840px] mx-auto">
          {/* Carte Les Vagues */}
          <div className="bg-white rounded-[14px] p-6 shadow-public-sm border border-public-border-subtle">
            <h3 className="font-public-serif text-[18px] font-semibold text-public-text-dark mb-3">
              {CLINICS.lesvagues.name} &middot; Rosemont
            </h3>
            <div className="text-[14px] text-public-text-medium space-y-1.5">
              <p>{CLINICS.lesvagues.address}</p>
              <p>{CLINICS.lesvagues.days}</p>
              <p>{CLINICS.lesvagues.phone} (appel ou texto)</p>
              <a
                href={CLINICS.lesvagues.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-1 text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
              >
                lesvaguesct.com
              </a>
            </div>
            <a
              href={`https://maps.google.com/?q=${CLINICS.lesvagues.mapsQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-[13px] text-public-text-medium underline underline-offset-4 hover:text-public-text-dark transition-colors"
            >
              Voir sur Google Maps
            </a>
          </div>

          {/* Carte Eden */}
          <div className="bg-white rounded-[14px] p-6 shadow-public-sm border border-public-border-subtle">
            <h3 className="font-public-serif text-[18px] font-semibold text-public-text-dark mb-3">
              {CLINICS.eden.name} &middot; Repentigny
            </h3>
            <div className="text-[14px] text-public-text-medium space-y-1.5">
              <p>{CLINICS.eden.address}</p>
              <p>{CLINICS.eden.days}</p>
              <a
                href={CLINICS.eden.siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-1 text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
              >
                edenyogapilates.ca
              </a>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-[13px] text-public-text-light">
          Anciennement &agrave; la clinique La Source en Soi (2024&ndash;2026).
        </p>
      </div>
    </GrainOverlay>
  );
}
