import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
};

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <p className="font-public-sans text-sm font-medium uppercase tracking-[0.2em] text-public-accent-warm">
        Placeholder MW-B1
      </p>
      <h1 className="mt-6 font-public-serif text-4xl font-medium text-public-text-dark">
        Blog
      </h1>
      <p className="mt-4 font-public-sans text-public-text-medium">
        Cette page sera construite dans un milestone ultérieur.
      </p>
    </main>
  );
}
