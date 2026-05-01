import type { Metadata } from 'next';
import GsapBootstrap from './GsapBootstrap';
import LenisProvider from './LenisProvider';
import ServiceFertiliteHeroSectionLab from '../../_sections/_lab/ServiceFertiliteHeroSectionLab';
import ServiceFertiliteBioSectionLab from '../../_sections/_lab/ServiceFertiliteBioSectionLab';
import ServiceFertiliteBenefitsSectionLab from '../../_sections/_lab/ServiceFertiliteBenefitsSectionLab';
import ServiceFertiliteHommeSectionLab from '../../_sections/_lab/ServiceFertiliteHommeSectionLab';
import ServiceFertiliteCollaborationSectionLab from '../../_sections/_lab/ServiceFertiliteCollaborationSectionLab';
import ServiceFertiliteTemoignageSectionLab from '../../_sections/_lab/ServiceFertiliteTemoignageSectionLab';
import ServiceFertiliteInfosSectionLab from '../../_sections/_lab/ServiceFertiliteInfosSectionLab';
import ServiceFertiliteCtaSectionLab from '../../_sections/_lab/ServiceFertiliteCtaSectionLab';

export const metadata: Metadata = {
  title: 'LAB - Animations',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function AnimationsLabPage() {
  return (
    <>
      <GsapBootstrap />
      <LenisProvider />
      <div className="bg-amber-500 text-white text-center py-2 text-[12px] font-semibold uppercase tracking-[2px]">
        LAB - Page de test animations - Non indexee
      </div>
      <ServiceFertiliteHeroSectionLab />
      <ServiceFertiliteBioSectionLab />
      <ServiceFertiliteBenefitsSectionLab />
      <ServiceFertiliteHommeSectionLab />
      <ServiceFertiliteCollaborationSectionLab />
      <ServiceFertiliteTemoignageSectionLab />
      <ServiceFertiliteInfosSectionLab />
      <ServiceFertiliteCtaSectionLab />
    </>
  );
}
