import Link from 'next/link';

export default function BlogNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-5 md:px-8 py-24 text-center">
      <h1 className="font-public-serif text-4xl font-medium text-public-text-dark mb-4">
        Article non trouve
      </h1>
      <p className="text-public-text-medium mb-8">
        L&apos;article que vous cherchez n&apos;existe pas ou a ete deplace.
      </p>
      <Link
        href="/blog"
        className="text-public-accent-taupe-dark underline underline-offset-4"
      >
        Retour aux articles
      </Link>
    </main>
  );
}
