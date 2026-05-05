import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';

export default function ServiceFertiliteHommeSection() {
  return (
    <section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8 relative overflow-hidden">
      <div className="max-w-[780px] mx-auto relative z-10">
        <SectionNumber number="03" align="left" />
        <SectionHeading
          kicker="POUR LES HOMMES AUSSI"
          title="L&rsquo;acupuncture peut-elle am&eacute;liorer la fertilit&eacute; masculine ?"
          align="left"
        />

        <div className="mt-8 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
          <p>
            Chez l&rsquo;homme, l&rsquo;acupuncture peut aider &agrave; am&eacute;liorer la qualit&eacute;,
            la quantit&eacute; et la motilit&eacute; des spermatozo&iuml;des.
            &Eacute;tant donn&eacute; que la spermatogen&egrave;se prend environ 72 jours,
            il est g&eacute;n&eacute;ralement recommand&eacute; de suivre <strong className="text-public-text-dark">9 &agrave; 10
            s&eacute;ances</strong> pour observer des am&eacute;liorations lors du prochain cycle de production.
          </p>
          <p>
            Certaines recherches suggèrent que l&rsquo;acupuncture pourrait aider &agrave; r&eacute;guler
            les hormones, et quelques &eacute;tudes indiquent un effet positif sur la production de testost&eacute;rone,
            notamment chez certains hommes infertiles.
          </p>
          <p>
            Par ailleurs, l&rsquo;acupuncture peut activer le syst&egrave;me parasympathique et favoriser une
            sensation de relaxation, ce qui aide &agrave; r&eacute;duire le stress li&eacute; &agrave; la fertilit&eacute;
            &mdash; un facteur qui touche les couples autant que les femmes seules.
          </p>
        </div>
      </div>
    </section>
  );
}
