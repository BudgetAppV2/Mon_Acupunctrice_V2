import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accueil',
  description:
    'Acupunctrice à Montréal. Fertilité, grossesse, pédiatrie, acupuncture sociale. Clinique La Source en Soi à Rosemont.',
};

export default function PublicHomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <p className="font-public-sans text-sm font-medium uppercase tracking-[0.2em] text-public-accent-warm">
        Site en construction — MW-B1
      </p>
      <h1 className="mt-6 font-public-serif text-5xl font-medium leading-tight text-public-text-dark md:text-6xl">
        Judith Dufour-Savard
      </h1>
      <p className="mt-4 font-public-serif text-2xl italic text-public-text-medium">
        Acupunctrice à Montréal
      </p>
      <p className="mt-10 font-public-sans text-base leading-relaxed text-public-text-medium">
        Cette page est un placeholder technique. Le squelette du route group
        public est en place : tokens v4, fonts Cormorant Garamond + Inter, et
        layout dédié. Les vraies pages arriveront dans les milestones MW-B3
        (composants) puis MW-C1 (homepage portée de la v4).
      </p>
      <div className="mt-12 inline-flex items-center gap-2 rounded-full border border-public-border-subtle bg-public-beige-light px-5 py-3 font-public-sans text-sm text-public-text-medium shadow-public-sm">
        <span className="font-semibold text-public-accent-taupe-dark">
          La Source en Soi
        </span>
        <span aria-hidden="true">·</span>
        <span>4,9 / 5 — 1 200+ avis Google</span>
      </div>
    </main>
  );
}
