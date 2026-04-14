import type { Metadata } from 'next';
import SectionHeading from './_components/SectionHeading';
import SectionNumber from './_components/SectionNumber';
import CtaButton from './_components/CtaButton';
import ClinicBadge from './_components/ClinicBadge';
import TestimonialCard from './_components/TestimonialCard';
import PilierCard from './_components/PilierCard';

export const metadata: Metadata = {
  title: 'Accueil',
  description:
    'Acupunctrice a Montreal. Fertilite, grossesse, pediatrie, acupuncture sociale. Clinique La Source en Soi a Rosemont.',
};

export default function PublicHomePage() {
  return (
    <main className="mx-auto max-w-[1280px] px-5 md:px-8">
      {/* Section 1 — Heading */}
      <section className="py-16 md:py-24">
        <SectionNumber number="01" />
        <SectionHeading
          kicker="MW-B3 DESIGN SYSTEM"
          title="Composants en vitrine"
          subtitle="Cette page valide visuellement le design system du site public. Elle sera remplacee par la vraie homepage en MW-C1."
        />
      </section>

      {/* Section 2 — CTA buttons */}
      <section className="pb-16 flex flex-wrap items-center gap-6">
        <CtaButton variant="primary" size="lg">
          Reserver une seance
        </CtaButton>
        <CtaButton variant="secondary">En savoir plus</CtaButton>
      </section>

      {/* Section 3 — Clinic badges */}
      <section className="pb-16 flex flex-col gap-4">
        <ClinicBadge variant="full" />
        <ClinicBadge variant="compact" />
      </section>

      {/* Section 4 — Testimonial */}
      <section className="pb-16 max-w-2xl">
        <TestimonialCard
          quote="Un accompagnement exceptionnel tout au long de mon parcours de fertilite. Judith a su m'ecouter et m'accompagner avec douceur."
          name="Marie"
          detail="Rosemont"
        />
      </section>

      {/* Section 5 — Pilier cards */}
      <section className="pb-16">
        <SectionNumber number="02" align="left" />
        <SectionHeading
          kicker="PILIERS"
          title="Specialisations"
          align="left"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          <PilierCard
            title="Fertilite"
            description="Accompagnement doux pour la conception, soutien pendant les traitements de fertilite."
            href="/services/fertilite"
            featured
          />
          <PilierCard
            title="Grossesse & perinatalite"
            description="Accompagnement pendant la grossesse et apres la naissance."
            href="/services/grossesse"
          />
        </div>
      </section>
    </main>
  );
}
