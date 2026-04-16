import CtaButton from '../_components/CtaButton';

export default function CtaFinalSection() {
  return (
    <section className="bg-gradient-to-b from-public-accent-taupe to-public-accent-taupe-dark text-white py-[68px] md:py-[108px] px-5 md:px-8 border-t-[3px] border-public-accent-warm relative overflow-hidden">
      {/* Deco botanique gauche — inline, pas BotanicalDeco (blend-mode screen) */}
      <div
        className="absolute top-[-40px] left-[-80px] w-[32%] h-full pointer-events-none z-0 hidden md:block overflow-hidden"
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/site/svg/plant.webp"
          alt=""
          loading="lazy"
          className="w-full h-full object-cover object-center"
          style={{ mixBlendMode: 'screen', transform: 'scale(2.2)', transformOrigin: 'center center' }}
        />
      </div>

      {/* Deco botanique droite — miroir horizontal */}
      <div
        className="absolute top-[-40px] right-[-80px] w-[32%] h-full pointer-events-none z-0 hidden md:block overflow-hidden"
        aria-hidden="true"
        style={{ transform: 'scaleX(-1)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/site/svg/plant.webp"
          alt=""
          loading="lazy"
          className="w-full h-full object-cover object-center"
          style={{ mixBlendMode: 'screen', transform: 'scale(2.2)', transformOrigin: 'center center' }}
        />
      </div>

      {/* Contenu */}
      <div className="max-w-[720px] mx-auto text-center relative z-10">
        <span className="block text-[11px] font-semibold tracking-[2.5px] uppercase opacity-90 mb-4">
          PR&Ecirc;TE &Agrave; COMMENCER
        </span>
        <h2 className="font-public-serif text-[36px] md:text-[54px] font-medium leading-[1.1] tracking-tight mb-6">
          Venez comme vous &ecirc;tes.
        </h2>
        <p className="font-public-serif text-[16px] md:text-[18px] italic opacity-[0.92] mb-10">
          60 minutes d&rsquo;&eacute;coute, d&rsquo;&eacute;valuation et de soin.
          &Agrave; La Source en Soi, sur Beaubien Est, dans Rosemont.
        </p>
        <CtaButton
          variant="white"
          size="lg"
          href="https://www.gorendezvous.com/lasourceensoi?companyId=104074"
        >
          Prendre rendez-vous en ligne
        </CtaButton>

        <div className="mt-12 pt-6 border-t border-white/20 flex flex-col md:flex-row justify-center gap-4 md:gap-8 text-[14px] opacity-80">
          <span className="flex items-center justify-center gap-2">
            <MapPinIcon />
            2554 rue Beaubien Est, Montr&eacute;al
          </span>
          <span className="flex items-center justify-center gap-2">
            <PhoneIcon />
            514 750-3735
          </span>
        </div>
      </div>
    </section>
  );
}

function MapPinIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>;
}

function PhoneIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>;
}
