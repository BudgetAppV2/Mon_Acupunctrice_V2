'use client';

import Reveal from '../_components/animations/Reveal';
import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';

export default function AboutParcoursSection() {
  return (
    <section className="bg-white py-[68px] md:py-[104px] px-5 md:px-8 relative overflow-hidden">
      {/* SVG hands-lotus en filigrane droite */}
      <div
        className="absolute -right-[100px] top-[20px] w-[440px] h-[540px] pointer-events-none z-0 hidden lg:block"
        aria-hidden="true"
        style={{ transform: 'rotate(8deg)', opacity: 0.12, mixBlendMode: 'multiply' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/site/svg/hands-lotus.svg" alt="" loading="lazy" className="w-full h-full object-contain" />
      </div>
      <div className="max-w-[780px] mx-auto relative z-10">
        <Reveal scaleFrom={0.7} delay={0.1} duration={0.8}>
          <SectionNumber number="01" align="left" />
        </Reveal>
        <Reveal>
          <SectionHeading
            kicker="MON PARCOURS"
            title="D&rsquo;une sc&egrave;ne &agrave; l&rsquo;autre."
            align="left"
          />
        </Reveal>

        <Reveal delay={0.15}>
        <div className="mt-8 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
          <p>
            Avant de devenir acupunctrice, j&rsquo;ai eu une premi&egrave;re vie dans le monde
            du spectacle vivant &mdash; en r&eacute;gie et en &eacute;clairage.
          </p>
          <p>
            Puis il y a eu mes enfants. Et avec eux, la d&eacute;couverte d&rsquo;un autre monde :
            celui de la naissance, de la p&eacute;rinatalit&eacute;, du lien qui se tisse entre
            un parent et un b&eacute;b&eacute;.
          </p>
          <p>
            J&rsquo;ai voulu comprendre ce monde de l&rsquo;int&eacute;rieur. J&rsquo;ai compl&eacute;t&eacute;
            mon DEC en acupuncture au Coll&egrave;ge de Rosemont, et pendant mes &eacute;tudes,
            j&rsquo;ai travaill&eacute; &agrave; la Maison de naissance C&ocirc;te-des-Neiges o&ugrave;
            j&rsquo;ai accompagn&eacute; de nombreuses familles dans les d&eacute;buts de la vie.
          </p>
          <p>
            Cette exp&eacute;rience &mdash; les naissances physiologiques, les premiers pas de parents,
            la fragilit&eacute; et la force qui coexistent dans ces moments-l&agrave; &mdash; m&rsquo;a
            profond&eacute;ment marqu&eacute;e. C&rsquo;est elle qui a orient&eacute; ma pratique vers
            ce qu&rsquo;elle est aujourd&rsquo;hui : un soin centr&eacute; sur la femme, la famille,
            et les transitions de vie.
          </p>
          <p>
            Avec les ann&eacute;es, j&rsquo;ai aussi eu envie de m&rsquo;impliquer au-del&agrave; de
            ma pratique en clinique. J&rsquo;ai si&eacute;g&eacute; au conseil d&rsquo;administration
            de l&rsquo;Association des Acupuncteurs du Qu&eacute;bec, o&ugrave; j&rsquo;ai contribu&eacute;
            aux r&eacute;flexions qui font &eacute;voluer la profession. C&rsquo;est une exp&eacute;rience
            qui m&rsquo;a beaucoup appris, et qui m&rsquo;a fait voir le m&eacute;tier sous un autre angle.
          </p>
        </div>
        </Reveal>
      </div>
    </section>
  );
}
