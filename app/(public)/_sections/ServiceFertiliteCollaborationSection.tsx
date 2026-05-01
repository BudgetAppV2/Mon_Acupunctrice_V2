import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';

export default function ServiceFertiliteCollaborationSection() {
  return (
    <section className="bg-public-beige-bg py-[68px] md:py-[104px] px-5 md:px-8 border-t border-b border-public-accent-warm/20">
      <div className="max-w-[780px] mx-auto">
        <SectionNumber number="04" align="left" />
        <SectionHeading
          kicker="COMPL&Eacute;MENT, JAMAIS OPPOSITION"
          title="J&rsquo;accompagne votre suivi m&eacute;dical."
          align="left"
        />

        <div className="mt-8 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
          <p>
            J&rsquo;accompagne r&eacute;guli&egrave;rement des femmes suivies dans les cliniques
            de fertilit&eacute; de Montr&eacute;al. Mon r&ocirc;le est compl&eacute;mentaire &agrave;
            votre suivi m&eacute;dical, jamais en opposition. Je vous encourage &agrave; tenir votre
            &eacute;quipe m&eacute;dicale inform&eacute;e de votre d&eacute;marche.
          </p>
          <p>
            Si vous avez des r&eacute;sultats d&rsquo;examens (bilan hormonal, hyst&eacute;rosalpingographie,
            bilan de fertilit&eacute;), apportez-les. On pourra en discuter ensemble.
          </p>
        </div>
      </div>
    </section>
  );
}
