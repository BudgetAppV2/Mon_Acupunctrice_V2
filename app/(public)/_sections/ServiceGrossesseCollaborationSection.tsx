import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';

export default function ServiceGrossesseCollaborationSection() {
  return (
    <section className="bg-public-beige-bg py-[68px] md:py-[104px] px-5 md:px-8 border-t border-b border-public-accent-warm/20">
      <div className="max-w-[780px] mx-auto">
        <SectionNumber number="03" align="left" />
        <SectionHeading
          kicker="EN COMPL&Eacute;MENT, JAMAIS EN OPPOSITION"
          title="Reconnue comme s&eacute;curitaire."
          align="left"
        />

        <div className="mt-8 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
          <p>
            L&rsquo;acupuncture est reconnue comme s&eacute;curitaire pendant la grossesse.
            J&rsquo;ai suivi une formation sp&eacute;cifique pour accompagner les femmes pendant
            leur grossesse. J&rsquo;utilise des aiguilles st&eacute;riles, &agrave; usage unique,
            plus fines qu&rsquo;un cheveu.
          </p>
          <p>
            Je travaille en compl&eacute;mentarit&eacute; avec votre m&eacute;decin, gyn&eacute;cologue
            ou sage-femme. Si vous avez des r&eacute;sultats d&rsquo;examens ou un suivi particulier,
            apportez-les &mdash; on pourra en discuter ensemble.
          </p>
        </div>
      </div>
    </section>
  );
}
