import Link from 'next/link';
import CtaButton from '../_components/CtaButton';
import CtaBotanicalDeco from '../_components/CtaBotanicalDeco';

export default function ServiceSocialeCtaSection() {
  return (
    <section className="bg-gradient-to-b from-public-accent-taupe to-public-accent-taupe-dark text-white py-[68px] md:py-[88px] px-5 md:px-8 text-center relative overflow-hidden">
      <CtaBotanicalDeco />
      <div className="max-w-[620px] mx-auto relative z-10">
        <h2 className="font-public-serif text-[32px] md:text-[44px] font-medium leading-[1.15] mb-4">
          Envie d&rsquo;essayer ?
        </h2>
        <p className="text-[16px] italic opacity-90 mb-8 font-public-serif">
          L&rsquo;acupuncture sociale, c&rsquo;est votre porte d&rsquo;entr&eacute;e vers un soin
          accessible, de qualit&eacute;, et sans jugement. Venez comme vous &ecirc;tes.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <CtaButton variant="white" size="lg" href="https://www.gorendezvous.com/lasourceensoi?companyId=104074">
            R&eacute;server une s&eacute;ance sociale
          </CtaButton>
          <CtaButton variant="secondary" href="/contact" className="text-white/80 hover:text-white">
            Ou &eacute;crivez-moi pour questions
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
