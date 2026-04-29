import PaperTexture from '../_components/PaperTexture';
import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';

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
        <SectionNumber number="03" align="left" />
        <SectionHeading
          kicker="LES ENFANTS NE SONT PAS DES ADULTES EN MINIATURE"
          title="Des s&eacute;ances adapt&eacute;es, des techniques douces."
          align="left"
        />

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

        <div className="mt-10 p-6 bg-public-beige-warm/40 rounded-[14px] border-l-4 border-public-accent-warm">
          <p className="text-[16px] leading-relaxed text-public-text-medium">
            Pour les b&eacute;b&eacute;s coliqueux, j&rsquo;utilise souvent{' '}
            <strong className="text-public-text-dark">une seule aiguille</strong>, ins&eacute;r&eacute;e
            pendant quelques secondes. C&rsquo;est tout. Bien souvent, les b&eacute;b&eacute;s
            ne pleurent pas.
          </p>
        </div>
      </div>
    </PaperTexture>
  );
}
