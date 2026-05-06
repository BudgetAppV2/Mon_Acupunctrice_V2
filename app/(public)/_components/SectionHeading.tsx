interface SectionHeadingProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  as?: 'h1' | 'h2' | 'h3';
}

export default function SectionHeading({
  kicker,
  title,
  subtitle,
  align = 'center',
  as,
}: SectionHeadingProps) {
  const textAlign = align === 'center' ? 'text-center' : 'text-left';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const HeadingTag = (as ?? 'h2') as any;

  return (
    <div className={textAlign}>
      {kicker && (
        <span className="block text-[11px] font-semibold tracking-[2.5px] uppercase text-public-accent-taupe-dark mb-3.5">
          {kicker}
        </span>
      )}
      <HeadingTag className="font-public-serif text-[34px] md:text-[46px] font-medium leading-[1.15] text-public-text-dark tracking-tight mb-5">
        {title}
      </HeadingTag>
      {subtitle && (
        <p
          className={`text-[17px] leading-relaxed text-public-text-medium max-w-[620px] ${
            align === 'center' ? 'mx-auto' : ''
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
