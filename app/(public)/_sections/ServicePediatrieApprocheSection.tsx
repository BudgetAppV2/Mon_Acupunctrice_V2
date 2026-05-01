'use client';

import PaperTexture from '../_components/PaperTexture';
import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';
import Reveal from '../_components/animations/Reveal';

const TECHNIQUES = [
  {
    name: 'Aiguilles ultra-fines',
    desc: 'Aiguilles de la grosseur d’un cheveu — la plupart des enfants ne sentent rien.',
  },
  {
    name: 'Aimants',
    desc: 'Collés sur les points, ne percent pas le derme.',
  },
  {
    name: 'Ventouse',
    desc: 'Création d’une succion temporaire sur la peau.',
  },
  {
    name: 'Shino shin',
    desc: 'Objet en forme d’éventail qui vient stimuler les points par la pression.',
  },
  {
    name: 'Tuina pédiatrique',
    desc: 'Massage chinois sur les points.',
  },
  {
    name: 'Acupression',
    desc: 'Simple pression douce, sans aiguilles.',
  },
];

export default function ServicePediatrieApprocheSection() {
  return (
    <PaperTexture variant="real" className="py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[960px] mx-auto">
        <Reveal scaleFrom={0.7} delay={0.1} duration={0.8}>
          <SectionNumber number="03" align="left" />
        </Reveal>
        <Reveal>
          <SectionHeading
            kicker="LES ENFANTS NE SONT PAS DES ADULTES EN MINIATURE"
            title="Des s&eacute;ances adapt&eacute;es, des techniques douces."
            align="left"
          />
        </Reveal>

        <Reveal delay={0.15}>
        <div className="mt-8 mb-10 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
          <p>
            L&rsquo;acupuncture p&eacute;diatrique est diff&eacute;rente de celle des adultes.
            Les s&eacute;ances sont <strong className="text-public-text-dark">plus courtes</strong>
            {' '}(20-30 min pour b&eacute;b&eacute;s, 30-45 min pour enfants),{' '}
            <strong className="text-public-text-dark">plus l&eacute;g&egrave;res</strong> (moins
            d&rsquo;aiguilles ou pas d&rsquo;aiguille, insertion plus br&egrave;ve), et{' '}
            <strong className="text-public-text-dark">plus flexibles</strong> (on s&rsquo;adapte
            &agrave; l&rsquo;enfant, pas l&rsquo;inverse).
          </p>
        </div>
        </Reveal>

        <Reveal delay={0.3}>
        <h3 className="font-public-serif text-[22px] font-semibold mb-6 text-public-text-dark">
          Techniques possibles selon l&rsquo;enfant
        </h3>
        <ul className="space-y-4">
          {TECHNIQUES.map((tech) => (
            <li
              key={tech.name}
              className="bg-white/70 backdrop-blur-sm p-5 rounded-[10px] border border-public-border-subtle"
            >
              <strong className="font-public-serif text-[17px] text-public-text-dark block mb-1">
                {tech.name}
              </strong>
              <span className="text-[14px] text-public-text-medium leading-relaxed">{tech.desc}</span>
            </li>
          ))}
        </ul>
        </Reveal>

        <Reveal delay={0.4}>
        <div className="mt-10 p-6 bg-public-beige-warm/40 rounded-[14px] border-l-4 border-public-accent-warm">
          <p className="text-[16px] leading-relaxed text-public-text-medium">
            Pour les b&eacute;b&eacute;s coliqueux, j&rsquo;utilise souvent{' '}
            <strong className="text-public-text-dark">une seule aiguille</strong>, ins&eacute;r&eacute;e
            pendant quelques secondes. C&rsquo;est tout. Bien souvent, les b&eacute;b&eacute;s
            ne pleurent pas.
          </p>
        </div>
        </Reveal>

        {/* A quoi s'attendre selon l'age */}
        <h3 className="mt-12 font-public-serif text-[22px] font-semibold mb-6 text-public-text-dark">
          &Agrave; quoi s&rsquo;attendre, selon l&rsquo;&acirc;ge
        </h3>
        <div className="space-y-4">
          <div className="bg-white/70 backdrop-blur-sm p-5 rounded-[10px] border border-public-border-subtle">
            <strong className="font-public-serif text-[17px] text-public-text-dark block mb-2">
              B&eacute;b&eacute;s (0-12 mois)
            </strong>
            <ul className="space-y-1.5 text-[14px] text-public-text-medium leading-relaxed">
              <li>&middot; <strong>Fr&eacute;quence (coliques)</strong> : 2 s&eacute;ances par semaine pendant 2-3 semaines.</li>
              <li>&middot; <strong>R&eacute;action typique</strong> : certains b&eacute;b&eacute;s ne r&eacute;agissent pas du tout, d&rsquo;autres pleurent bri&egrave;vement (moins qu&rsquo;&agrave; la vaccination).</li>
              <li>&middot; Le parent reste pr&egrave;s du b&eacute;b&eacute;, peut le tenir, l&rsquo;allaiter.</li>
            </ul>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-5 rounded-[10px] border border-public-border-subtle">
            <strong className="font-public-serif text-[17px] text-public-text-dark block mb-2">
              Enfants (1-12 ans)
            </strong>
            <ul className="space-y-1.5 text-[14px] text-public-text-medium leading-relaxed">
              <li>&middot; On commence par expliquer ce qu&rsquo;on va faire avec un langage adapt&eacute;.</li>
              <li>&middot; L&rsquo;enfant explore, touche les ventouses et/ou le shino shin, pose ses questions.</li>
              <li>&middot; Si l&rsquo;enfant ne veut pas d&rsquo;aiguilles : on a des alternatives sans aiguilles (ventouse, acupression, tuina).</li>
              <li>&middot; Le parent peut rester en salle, c&rsquo;est souvent rassurant.</li>
            </ul>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-5 rounded-[10px] border border-public-border-subtle">
            <strong className="font-public-serif text-[17px] text-public-text-dark block mb-2">
              Adolescents (12+)
            </strong>
            <ul className="space-y-1.5 text-[14px] text-public-text-medium leading-relaxed">
              <li>&middot; S&eacute;ance plus proche du format adulte, dans un cadre confidentiel.</li>
              <li>&middot; Le parent peut attendre &agrave; l&rsquo;ext&eacute;rieur si l&rsquo;adolescent le pr&eacute;f&egrave;re.</li>
              <li>&middot; <em>&Agrave; partir de 14 ans, l&rsquo;adolescent peut consentir aux soins sans l&rsquo;accord de ses parents.</em></li>
            </ul>
          </div>
        </div>
      </div>
    </PaperTexture>
  );
}
