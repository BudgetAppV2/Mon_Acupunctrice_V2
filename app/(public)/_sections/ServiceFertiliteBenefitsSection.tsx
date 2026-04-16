import Link from 'next/link';
import PaperTexture from '../_components/PaperTexture';
import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';

const BENEFITS = [
  "Régulariser un cycle menstruel irrégulier ou une ovulation absente",
  "Améliorer la circulation sanguine vers l'utérus et les ovaires",
  "Soutenir la qualité de l'endomètre et la réceptivité embryonnaire",
  "Atténuer le stress et l'anxiété qui affectent votre axe hormonal",
  "Mieux tolérer les effets secondaires des traitements hormonaux (FIV, IIU)",
  "Accompagner les conditions comme le SOPK ou l'endométriose",
];

export default function ServiceFertiliteBenefitsSection() {
  return (
    <PaperTexture variant="real" className="py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[960px] mx-auto">
        <SectionNumber number="02" align="left" />
        <SectionHeading
          kicker="CE QUE L'ACUPUNCTURE FAIT"
          title="Un soutien concret, pas des promesses."
          align="left"
        />

        <p className="mt-6 mb-10 text-[17px] leading-relaxed text-public-text-medium max-w-[720px]">
          L&rsquo;acupuncture ne gu&eacute;rit pas l&rsquo;infertilit&eacute;. Mais elle peut offrir
          plusieurs b&eacute;n&eacute;fices mesurables dans votre parcours &mdash; physiologiques
          et &eacute;motionnels.
        </p>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3 text-[15px] text-public-text-medium leading-relaxed">
              <CheckIcon />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-[16px] leading-relaxed text-public-text-medium max-w-[720px]">
          Chaque s&eacute;ance dure 60 minutes et s&rsquo;adapte &agrave; votre r&eacute;alit&eacute; :
          conception naturelle, ins&eacute;mination, FIV. Votre partenaire est aussi le bienvenu
          &mdash; la fertilit&eacute; masculine b&eacute;n&eacute;ficie &eacute;galement de l&rsquo;acupuncture.
        </p>

        <div className="mt-8">
          <Link
            href="/ressources/acupuncture-fertilite-montreal"
            className="text-[14px] font-medium text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
          >
            Explorez les &eacute;tudes scientifiques r&eacute;centes &rarr;
          </Link>
        </div>
      </div>
    </PaperTexture>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-public-accent-warm shrink-0 mt-0.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}
