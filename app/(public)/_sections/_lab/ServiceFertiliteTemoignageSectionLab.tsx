'use client';

import Reveal from '../../_components/animations/Reveal';
import TestimonialCard from '../../_components/TestimonialCard';

export default function ServiceFertiliteTemoignageSectionLab() {
  return (
    <section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[780px] mx-auto">
        <Reveal y={24} duration={0.8}>
          <TestimonialCard
            quote='Juste un petit mot pour te dire que j&rsquo;ai eu un beau "positif". Le dernier traitement m&rsquo;a beaucoup aid&eacute;e.'
            name="Cliente, 41 ans"
            detail="T&eacute;moignage partag&eacute; avec son accord"
          />
        </Reveal>
      </div>
    </section>
  );
}
