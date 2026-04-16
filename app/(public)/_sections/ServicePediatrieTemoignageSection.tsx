import TestimonialCard from '../_components/TestimonialCard';

export default function ServicePediatrieTemoignageSection() {
  return (
    <section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[780px] mx-auto">
        <TestimonialCard
          featured
          quote={
            "Je suis venue voir Judith pour aider mon enfant de 6 ans. Elle a \u00e9t\u00e9 super ! " +
            "Il ne voulait pas des aiguilles, elle a trouv\u00e9 d'autres fa\u00e7ons de le traiter " +
            "(avec des aimants). Il a beaucoup appr\u00e9ci\u00e9 la s\u00e9ance. J'ai aussi \u00e9t\u00e9 " +
            "trait\u00e9e par Judith \u00e0 d'autres occasions (sant\u00e9 des femmes) et \u00e7a m'a fait " +
            "beaucoup de bien."
          }
          name="Parent d'un enfant de 6 ans"
          detail="Avis Google sur la clinique La Source en Soi"
        />
      </div>
    </section>
  );
}
