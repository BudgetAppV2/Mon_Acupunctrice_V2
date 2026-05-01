'use client';

import Reveal from '../_components/animations/Reveal';
import PaperTexture from '../_components/PaperTexture';
import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';

export default function AboutPratiqueSection() {
  return (
    <PaperTexture variant="real" className="py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[780px] mx-auto">
        <SectionNumber number="02" align="left" />
        <SectionHeading
          kicker="CE QUE JE FAIS"
          title="Une approche profond&eacute;ment humaine."
          align="left"
        />

        <div className="mt-8 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
          <p>
            Dans mon cabinet, chaque s&eacute;ance dure{' '}
            <strong className="text-public-text-dark">60 minutes</strong>. Je prends le temps
            d&rsquo;&eacute;couter ce que vous venez d&eacute;poser, d&rsquo;&eacute;valuer, de traiter,
            et de vous expliquer ce que je fais et pourquoi.
          </p>
          <p>
            La sant&eacute; des femmes est au c&oelig;ur de ma pratique. Menstruation, fertilit&eacute;,
            grossesse, post-partum, m&eacute;nopause &mdash; ces passages m&eacute;ritent un accompagnement
            attentif et respectueux. Mais mon cabinet n&rsquo;est pas r&eacute;serv&eacute; aux femmes :
            j&rsquo;accueille aussi les enfants (avec des techniques adapt&eacute;es, douces, souvent sans
            aiguilles pour les plus petits) et toute personne qui cherche un soin global.
          </p>
          <p>
            Je me forme continuellement aupr&egrave;s de professionnels experts en leur domaine pour enrichir ma pratique.
          </p>
        </div>
      </div>
    </PaperTexture>
  );
}
