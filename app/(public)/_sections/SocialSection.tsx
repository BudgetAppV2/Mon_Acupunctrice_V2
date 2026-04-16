export default function SocialSection() {
  return (
    <section className="relative border-y border-public-border-subtle py-[68px] md:py-[88px] px-5 md:px-8 overflow-hidden">
      {/* Fond pattern SVG seamless — line-art femmes enceintes + botaniques */}
      <div
        className="absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          backgroundImage: 'url("/site/svg/social-pattern.svg")',
          backgroundSize: '1800px',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
          opacity: 0.55,
        }}
      />
      {/* Overlay blanc semi-transparent pour adoucir le pattern */}
      <div className="absolute inset-0 z-0 bg-white/60" aria-hidden="true" />

      <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-[260px_1fr_auto] gap-10 items-center relative z-10">
        {/* Card Instagram */}
        <div className="relative w-[240px] md:w-[260px] aspect-square mx-auto md:mx-0 rounded-[14px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/site/judith/judith-portrait-03.webp"
            alt=""
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/55" />
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <p className="font-public-serif text-[15px] italic text-white drop-shadow-md">
              Derri&egrave;re chaque aiguille, une intention.
            </p>
            <p className="text-[11px] text-white/85 mt-1">
              @mon_acupunctrice &middot; Instagram
            </p>
          </div>
        </div>

        {/* Texte central */}
        <div className="text-center md:text-left">
          <h3 className="font-public-serif text-[22px] font-semibold text-public-text-dark mb-2">
            Suivez mon quotidien
          </h3>
          <p className="text-[14px] text-public-text-medium max-w-[400px] mx-auto md:mx-0">
            Je partage r&eacute;flexions, gestes et moments de clinique sur Instagram.
            J&rsquo;ai aussi lanc&eacute; r&eacute;cemment une cha&icirc;ne YouTube.
          </p>
        </div>

        {/* Pills sociaux */}
        <div className="flex flex-wrap justify-center md:justify-end gap-3">
          <a
            href="https://www.instagram.com/mon_acupunctrice/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-public-border-subtle px-4 py-2.5 text-[13px] font-medium text-public-text-medium hover:border-public-accent-taupe hover:-translate-y-px hover:shadow-public-sm transition-all"
          >
            <IgIcon />
            Instagram
          </a>
          <a
            href="https://www.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-public-border-subtle px-4 py-2.5 text-[13px] font-medium text-public-text-medium hover:border-public-accent-taupe hover:-translate-y-px hover:shadow-public-sm transition-all"
          >
            <YtIcon />
            YouTube
          </a>
        </div>
      </div>
    </section>
  );
}

function IgIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" style={{ color: '#C13584' }}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function YtIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" style={{ color: '#FF0000' }}>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
