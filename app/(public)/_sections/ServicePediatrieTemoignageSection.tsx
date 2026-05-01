'use client';

import TestimonialCard from '../_components/TestimonialCard';
import Reveal from '../_components/animations/Reveal';

export default function ServicePediatrieTemoignageSection() {
  return (
    <section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[780px] mx-auto">
        <TestimonialCard
          featured
          quote={
            "Je suis venue voir Judith pour aider mon enfant de 6 ans. Elle a été super ! " +
            "Il ne voulait pas des aiguilles, elle a trouvé d'autres façons de le traiter " +
            "(avec des aimants). Il a beaucoup apprécié la séance. J'ai aussi été " +
            "traitée par Judith à d'autres occasions (santé des femmes) et ça m'a fait " +
            "beaucoup de bien."
          }
          name="Parent d'un enfant de 6 ans"
          detail="Avis Google sur la clinique La Source en Soi"
        />
      </div>
    </section>
  );
}
