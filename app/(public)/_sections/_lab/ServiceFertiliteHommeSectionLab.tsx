'use client';

import Reveal from '../../_components/animations/Reveal';
import ScrollHighlightText from '../../_components/animations/ScrollHighlightText';
import SectionHeading from '../../_components/SectionHeading';

/**
 * Section Homme avec ScrollHighlightText : les paragraphes commencent en gris pale
 * et chaque mot s'assombrit l'un apres l'autre au fur et a mesure que l'utilisateur
 * scrolle dans la section. Effet editorial type Apple Health Stories / NYT.
 *
 * Sensation de "lecture qui se construit" pendant le scroll.
 */
export default function ServiceFertiliteHommeSectionLab() {
  return (
    <section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[780px] mx-auto">
        <Reveal>
          <SectionHeading
            kicker="FERTILIT&Eacute; MASCULINE"
            title="Votre conjoint est aussi le bienvenu."
            align="left"
          />
        </Reveal>

        <div className="mt-8 space-y-6 text-[17px] leading-[1.75]">
          <ScrollHighlightText
            text="Chez l'homme, l'acupuncture peut améliorer la qualité, la quantité et la motilité des spermatozoïdes."
            start="top 75%"
            end="bottom 55%"
          />
          <ScrollHighlightText
            text="Certaines recherches suggèrent que l'acupuncture pourrait aider à réguler les hormones."
            start="top 75%"
            end="bottom 50%"
          />
          <ScrollHighlightText
            text="Par ailleurs, l'acupuncture peut activer le système parasympathique et favoriser une sensation de relaxation."
            start="top 75%"
            end="bottom 45%"
          />
        </div>
      </div>
    </section>
  );
}
