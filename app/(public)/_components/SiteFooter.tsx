import Link from 'next/link';

const SERVICES = [
  { href: '/services/fertilite', label: 'Fertilite' },
  { href: '/services/grossesse', label: 'Grossesse' },
  { href: '/services/pediatrie', label: 'Pediatrie' },
  { href: '/services/acupuncture-sociale', label: 'Acupuncture sociale' },
] as const;

const CONTENU = [
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
  { href: '/ressources', label: 'Ressources' },
] as const;

export default function SiteFooter() {
  return (
    <footer className="bg-public-text-dark text-public-beige-light">
      <div className="max-w-[1280px] mx-auto px-5 pt-16 pb-8 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 pb-12 border-b border-white/10">
          {/* Brand */}
          <div>
            <h3 className="font-public-serif text-2xl font-semibold mb-2">
              Judith Dufour-Savard
            </h3>
            <p className="text-[13px] leading-relaxed opacity-70 max-w-[320px]">
              Acupunctrice &agrave; Rosemont et Repentigny, specialis&eacute;e en fertilit&eacute;, grossesse
              et acupuncture sociale.
            </p>
            <p className="text-[12px] opacity-50 mt-3">
              Membre de l&rsquo;{' '}
              <a
                href="https://o-a-q.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                Ordre des acupuncteurs du Qu&eacute;bec
              </a>
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[11px] font-semibold tracking-[1.5px] uppercase opacity-60 mb-4">
              Services
            </h4>
            <ul className="flex flex-col gap-2.5">
              {SERVICES.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[13px] opacity-85 hover:opacity-100 transition-opacity"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contenu */}
          <div>
            <h4 className="text-[11px] font-semibold tracking-[1.5px] uppercase opacity-60 mb-4">
              Contenu
            </h4>
            <ul className="flex flex-col gap-2.5">
              {CONTENU.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[13px] opacity-85 hover:opacity-100 transition-opacity"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[11px] font-semibold tracking-[1.5px] uppercase opacity-60 mb-4">
              Cliniques
            </h4>
            <ul className="flex flex-col gap-2.5 text-[13px] opacity-85">
              <li>La Source en Soi &mdash; Rosemont</li>
              <li>&Eacute;den Yoga Pilates &mdash; Repentigny</li>
              <li className="flex gap-4 mt-2">
                <a
                  href="https://www.instagram.com/mon_acupunctrice/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-100 transition-opacity"
                >
                  Instagram
                </a>
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-100 transition-opacity"
                >
                  Facebook
                </a>
                <a
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-100 transition-opacity"
                >
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <p className="text-center text-xs opacity-60 mt-8">
          La Source en Soi (Rosemont) &middot; &Eacute;den Yoga Pilates (Repentigny)
          {' · '}
          &copy; 2026 Judith Dufour-Savard
        </p>
        <p className="text-center mt-3">
          <a
            href="/calendrier"
            className="text-[10px] opacity-30 hover:opacity-60 transition-opacity"
          >
            Espace admin
          </a>
        </p>
      </div>
    </footer>
  );
}
