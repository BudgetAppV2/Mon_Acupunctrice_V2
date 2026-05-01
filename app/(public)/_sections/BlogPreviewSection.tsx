import Link from 'next/link';
import SectionNumber from '../_components/SectionNumber';
import SectionHeading from '../_components/SectionHeading';
import { getRecentBlogPosts } from '@/lib/firestore/public-blog';

function formatDate(publishedAt: { toDate?: () => Date; _seconds?: number; seconds?: number } | null): string {
  if (!publishedAt) return '';
  const date = publishedAt.toDate
    ? publishedAt.toDate()
    : (publishedAt._seconds ?? publishedAt.seconds)
      ? new Date((publishedAt._seconds ?? publishedAt.seconds ?? 0) * 1000)
      : null;
  if (!date) return '';
  return date.toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function BlogPreviewSection() {
  const posts = await getRecentBlogPosts(6);

  return (
    <section className="bg-public-beige-light py-[68px] md:py-[104px] px-5 md:px-8">
      <div className="max-w-[1280px] mx-auto">
        <SectionNumber number="05" />
        <SectionHeading
          kicker="LE CARNET"
          title="Derniers articles"
          subtitle="Quelques r&eacute;flexions et explications sur l'acupuncture, la fertilit&eacute;, la grossesse et la vie de famille."
        />

        <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory mt-12 pb-4 -mx-5 px-5 md:-mx-8 md:px-8 scrollbar-thin">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex-none w-[280px] md:w-[440px] snap-start bg-white border border-public-border-subtle rounded-[14px] overflow-hidden hover:-translate-y-1 hover:shadow-public-md hover:border-public-accent-taupe transition-all"
            >
              {post.coverImage && (
                <div className="relative aspect-[16/10] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6 flex flex-col">
                {post.category && (
                  <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-public-accent-taupe-dark mb-2.5">
                    {post.category}
                  </span>
                )}
                <h3 className="font-public-serif text-[22px] font-semibold leading-[1.3] text-public-text-dark mb-2.5 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-[14px] text-public-text-medium leading-relaxed mb-3.5 line-clamp-2">
                  {post.excerpt}
                </p>
                <span className="text-[12px] text-public-text-light">
                  {formatDate(post.publishedAt as { toDate?: () => Date; _seconds?: number } | null)}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/blog"
            className="text-[14px] font-medium text-public-accent-warm underline underline-offset-4 decoration-1 hover:text-public-accent-warm-soft transition-colors"
          >
            Voir tous les articles du carnet &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
