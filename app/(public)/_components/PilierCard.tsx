import Link from 'next/link';
import Image from 'next/image';

interface PilierCardProps {
  title: string;
  description: string;
  image?: string;
  href: string;
  featured?: boolean;
}

export default function PilierCard({
  title,
  description,
  image,
  href,
  featured = false,
}: PilierCardProps) {
  return (
    <Link
      href={href}
      className={`group flex flex-col border rounded-[14px] overflow-hidden transition-all duration-[350ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] text-inherit no-underline hover:-translate-y-1.5 hover:shadow-public-lg hover:border-public-accent-warm ${
        featured
          ? 'shadow-public-lg border-public-accent-warm/25'
          : 'border-public-border-subtle'
      }`}
    >
      <div className="aspect-square overflow-hidden bg-public-beige-dark relative">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            unoptimized
            className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full bg-public-beige-dark" />
        )}
      </div>

      <div className="p-8 flex flex-col flex-1">
        <h3 className="font-public-serif text-[28px] font-semibold text-public-text-dark leading-tight mb-3.5">
          {title}
        </h3>
        <p className="text-[15px] text-public-text-medium leading-relaxed mb-5 flex-1">
          {description}
        </p>
        <span className="text-[13px] font-semibold text-public-accent-warm tracking-[0.3px] inline-flex items-center gap-1.5">
          En savoir plus
          <span
            className="transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          >
            &rarr;
          </span>
        </span>
      </div>
    </Link>
  );
}
