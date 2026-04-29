import Link from 'next/link';
import CtaButton from '../_components/CtaButton';
import CtaBotanicalDeco from '../_components/CtaBotanicalDeco';

export default function ServicePediatrieCtaSection() {
  return (
    <section className="bg-gradient-to-b from-public-accent-taupe to-public-accent-taupe-dark text-white py-[68px] md:py-[88px] px-5 md:px-8 text-center relative overflow-hidden">
      <CtaBotanicalDeco />
      <div className="max-w-[620px] mx-auto relative z-10">
        <h2 className="font-public-serif text-[32px] md:text-[44px] font-medium leading-[1.15] mb-4">
          Envie d&rsquo;en parler ?
        </h2>
        <p className="text-[16px] italic opacity-90 mb-8 font-public-serif">
          Si votre b&eacute;b&eacute; pleure sans arr&ecirc;t ou si votre enfant traverse une
          p&eacute;riode difficile, on peut en parler. La premi&egrave;re rencontre est toujours
          un &eacute;change doux et sans pression.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <CtaButton variant="white" size="lg" href="/reserver">
            Prendre rendez-vous en ligne
          </CtaButton>
          <CtaButton variant="secondary" href="/contact" className="text-white/80 hover:text-white">
            Ou &eacute;crivez-moi
          </CtaButton>
        </div>
        <p className="mt-4 text-[13px] text-white/60">
          Disponible &agrave; Rosemont (La Source en Soi) et &agrave; Repentigny (&Eacute;den Yoga Pilates).
        </p>
        <div className="mt-4 text-center">
          <Link href="/faq" className="text-[14px] text-white/70 underline underline-offset-4 hover:text-white transition-colors">
            Consulter les questions fr&eacute;quentes
          </Link>
        </div>
      </div>
    </section>
  );
}
