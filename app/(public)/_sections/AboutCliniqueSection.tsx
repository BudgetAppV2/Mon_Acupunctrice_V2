import GrainOverlay from '../_components/GrainOverlay';
import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';

export default function AboutCliniqueSection() {
  return (
    <GrainOverlay className="bg-public-beige-bg py-[68px] md:py-[104px] px-5 md:px-8 border-t border-b border-public-accent-warm/20">
      <div className="max-w-[1080px] mx-auto">
        <SectionNumber number="03" />
        <SectionHeading kicker="O&Ugrave; JE PRATIQUE" title="La Source en Soi." />

        <div className="max-w-[680px] mx-auto text-center mt-8 space-y-6 text-[17px] leading-[1.75] text-public-text-medium">
          <p>
            Je pratique &agrave; La Source en Soi, une clinique familiale sur Beaubien Est &agrave; Rosemont.
            L&rsquo;&eacute;quipe r&eacute;unit des acupunctrices, des ost&eacute;opathes, des sages-femmes
            et des doulas &mdash; chaque discipline se compl&egrave;te naturellement.
          </p>
          <p>
            Ce n&rsquo;est pas une clinique corporative. C&rsquo;est un lieu de soin port&eacute; par des
            valeurs humaines, ancr&eacute; dans la communaut&eacute; de Rosemont-Beaubien. Un endroit o&ugrave; on prend le temps.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mt-12">
          {/* Badge Google */}
          <a
            href="https://maps.google.com/?q=La+Source+en+Soi+Rosemont+Montreal"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 bg-white rounded-full px-6 py-3 shadow-public-sm border border-public-border-subtle hover:shadow-public-md transition-shadow"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-yellow-500 shrink-0">
              <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
            </svg>
            <span className="text-[14px] font-semibold text-public-text-dark">4,9/5</span>
            <span className="text-[13px] text-public-text-medium">sur 1 215 avis Google</span>
          </a>

          {/* Coordonnees */}
          <div className="text-center text-[14px] text-public-text-medium space-y-1">
            <p>2554 rue Beaubien Est, Montr&eacute;al, QC</p>
            <p>514 750-3735</p>
            <a
              href="https://lasourceensoi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-public-accent-warm underline underline-offset-4 hover:text-public-accent-warm-soft transition-colors"
            >
              lasourceensoi.com
            </a>
          </div>
        </div>
      </div>
    </GrainOverlay>
  );
}
