import Link from 'next/link';
import CtaButton from '../_components/CtaButton';

export default function ServiceGrossesseCtaSection() {
  return (
    <section className="bg-gradient-to-b from-public-accent-taupe to-public-accent-taupe-dark text-white py-[68px] md:py-[88px] px-5 md:px-8 text-center relative overflow-hidden">
      <div className="max-w-[620px] mx-auto relative z-10">
        <h2 className="font-public-serif text-[32px] md:text-[44px] font-medium leading-[1.15] mb-4">
          Pr&ecirc;te &agrave; commencer ?
        </h2>
        <p className="text-[16px] italic opacity-90 mb-8 font-public-serif">
          Qu&rsquo;il s&rsquo;agisse de naus&eacute;es au 1er trimestre, de douleurs au 2e, ou de
          pr&eacute;paration au 3e &mdash; on prend le temps de comprendre ce dont vous avez
          besoin aujourd&rsquo;hui.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <CtaButton variant="white" size="lg" href="https://www.gorendezvous.com/lasourceensoi?companyId=104074">
            Prendre rendez-vous en ligne
          </CtaButton>
          <CtaButton variant="secondary" href="/contact" className="text-white/80 hover:text-white">
            Ou &eacute;crivez-moi
          </CtaButton>
        </div>
        <div className="mt-6 text-center">
          <Link href="/faq" className="text-[14px] text-white/70 underline underline-offset-4 hover:text-white transition-colors">
            Consulter les questions fr&eacute;quentes
          </Link>
        </div>
      </div>
    </section>
  );
}
