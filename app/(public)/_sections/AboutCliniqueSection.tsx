'use client';

import Reveal from '../_components/animations/Reveal';
import GrainOverlay from '../_components/GrainOverlay';
import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';

export default function AboutCliniqueSection() {
  return (
    <GrainOverlay className="bg-public-beige-bg py-[68px] md:py-[104px] px-5 md:px-8 border-t border-b border-public-accent-warm/20">
      <div className="max-w-[1080px] mx-auto">
        <SectionNumber number="03" />
        <SectionHeading kicker="O&Ugrave; JE PRATIQUE" title="Deux lieux, une m&ecirc;me pr&eacute;sence." />

        <div className="max-w-[680px] mx-auto text-center mt-8 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
          <p>
            Mon cabinet principal est &agrave; <strong className="text-public-text-dark">La Source en Soi</strong>,
            une clinique familiale sur Beaubien Est &agrave; Rosemont. L&rsquo;&eacute;quipe r&eacute;unit
            des acupunctrices, des ost&eacute;opathes, des physioth&eacute;rapeutes
            et des doulas &mdash; chaque discipline se compl&egrave;te naturellement.
          </p>
          <p>
            Le mercredi, je pratique &agrave; <strong className="text-public-text-dark">&Eacute;den Yoga Pilates</strong>,
            &agrave; Repentigny. Un studio chaleureux qui me permet d&rsquo;accueillir aussi les patientes
            de la rive nord, dans un environnement d&eacute;di&eacute; au mouvement et au bien-&ecirc;tre.
          </p>
          <p>
            Ce ne sont pas des cliniques corporatives. Ce sont des lieux de soin port&eacute;s par des
            valeurs humaines, ancr&eacute;s dans leurs communaut&eacute;s. Des endroits o&ugrave; on prend le temps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-[840px] mx-auto">
          {/* Carte LSSI */}
          <div className="bg-white rounded-[14px] p-6 shadow-public-sm border border-public-border-subtle">
            <h3 className="font-public-serif text-[18px] font-semibold text-public-text-dark mb-3">
              La Source en Soi &middot; Rosemont
            </h3>
            <div className="text-[14px] text-public-text-medium space-y-1.5">
              <p>2554 rue Beaubien Est, Montr&eacute;al, QC</p>
              <p>Lundi, mardi, jeudi, vendredi</p>
              <p>514 750-3735</p>
              <a
                href="https://lasourceensoi.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-1 text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
              >
                lasourceensoi.com
              </a>
            </div>
            <a
              href="https://maps.google.com/?q=La+Source+en+Soi+Rosemont+Montreal"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 mt-4 text-[13px] text-public-text-medium hover:text-public-text-dark transition-colors"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-yellow-500 shrink-0">
                <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
              </svg>
              <span><strong>4,9/5</strong> sur 1 215 avis Google</span>
            </a>
          </div>

          {/* Carte Eden */}
          <div className="bg-white rounded-[14px] p-6 shadow-public-sm border border-public-border-subtle">
            <h3 className="font-public-serif text-[18px] font-semibold text-public-text-dark mb-3">
              &Eacute;den Yoga Pilates &middot; Repentigny
            </h3>
            <div className="text-[14px] text-public-text-medium space-y-1.5">
              <p>121 Boulevard Industriel, suite 225, Repentigny, QC</p>
              <p>Mercredi</p>
              <a
                href="https://edenyogapilates.ca/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-1 text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
              >
                edenyogapilates.ca
              </a>
            </div>
          </div>
        </div>
      </div>
    </GrainOverlay>
  );
}
