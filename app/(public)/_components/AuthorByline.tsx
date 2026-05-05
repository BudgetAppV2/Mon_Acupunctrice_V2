import Image from 'next/image';

/**
 * Byline auteur réutilisable — renforce E-E-A-T pour AEO/SEO.
 * Affiché en bas des pages services, blog et ressources.
 */
export default function AuthorByline() {
  return (
    <section className="bg-white py-10 px-5 md:px-8 border-t border-public-border-subtle">
      <div className="max-w-[780px] mx-auto flex items-center gap-4">
        <Image
          src="/site/judith/judith-portrait-01.webp"
          alt="Judith Dufour-Savard, acupunctrice"
          width={56}
          height={56}
          className="w-14 h-14 rounded-full object-cover shrink-0"
        />
        <div>
          <p className="font-medium text-[15px] text-public-text-dark">
            Judith Dufour-Savard, Ac.
          </p>
          <p className="text-[13px] text-public-text-medium leading-relaxed mt-0.5">
            Acupunctrice membre de l&rsquo;Ordre des acupuncteurs du Qu&eacute;bec (OAQ).
            DEC en acupuncture, Coll&egrave;ge de Rosemont.
          </p>
        </div>
      </div>
    </section>
  );
}
