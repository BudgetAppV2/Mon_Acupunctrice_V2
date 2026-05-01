'use client';

import TestimonialCard from '../_components/TestimonialCard';
import Reveal from '../_components/animations/Reveal';

export default function ServiceGrossesseTemoignageSection() {
  return (
    <section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[780px] mx-auto">
        {/* TODO Judith: remplacer par un vrai temoignage (en attente clarification OAQ sur utilisation d'avis Google) */}
        <TestimonialCard
          featured
          quote="Chaque s&eacute;ance est profond&eacute;ment apaisante. Judith transmet avec beaucoup de douceur son amour pour tout ce qui entoure la grossesse et la naissance."
          name="Patiente accompagn&eacute;e"
          detail="T&eacute;moignage partag&eacute; avec son accord"
        />
      </div>
    </section>
  );
}
