import PaperTexture from '../_components/PaperTexture';
import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';
import TestimonialCard from '../_components/TestimonialCard';

export default function TemoignagesSection() {
  return (
    <PaperTexture variant="real" className="bg-public-beige-warm py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[1280px] mx-auto">
        <SectionNumber number="03" />
        <SectionHeading
          kicker="CE QU'ELLES EN DISENT"
          title="Des parcours r&eacute;els"
          subtitle="Avis Google publics de la clinique La Source en Soi, o&ugrave; Judith pratique. 4,9/5 sur 1 215 avis."
        />

        <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] md:grid-rows-2 gap-6 mt-12">
          <TestimonialCard
            featured
            quote="Judith a su tout de suite me mettre &agrave; l'aise et &eacute;tant autiste, c'&eacute;tait pas gagn&eacute; d'avance, mais la douceur de cette petite f&eacute;e de l'acupuncture m'a ensorcel&eacute; de par sa gentillesse et son savoir faire."
            name="Alexandra P."
            detail="Avis Google &middot; La Source en Soi"
          />

          <TestimonialCard
            quote="J'ai consult&eacute; Judith pendant ma grossesse, et cela a fait une &eacute;norme diff&eacute;rence. Elle m'a beaucoup aid&eacute;e &agrave; diminuer les douleurs au dos et aux hanches."
            name="Ingrid M."
            detail="Avis Google &middot; La Source en Soi"
          />

          <TestimonialCard
            quote="Mon enfant de 6 ans ne voulait pas des aiguilles, elle a trouv&eacute; d'autres fa&ccedil;ons de le traiter avec des aimants. Il a beaucoup appr&eacute;ci&eacute; la s&eacute;ance."
            name="Parent d'un enfant de 6 ans"
            detail="Avis Google &middot; La Source en Soi"
          />
        </div>
      </div>
    </PaperTexture>
  );
}
