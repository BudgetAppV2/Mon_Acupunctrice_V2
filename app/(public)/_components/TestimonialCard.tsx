interface TestimonialCardProps {
  quote: string;
  name: string;
  detail?: string;
  avatarUrl?: string;
  featured?: boolean;
}

export default function TestimonialCard({
  quote,
  name,
  detail,
  avatarUrl,
  featured = false,
}: TestimonialCardProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className={`bg-white rounded-[14px] border-l-4 border-public-accent-warm ${
        featured ? 'p-12' : 'p-10'
      }`}
    >
      <blockquote
        className={`public-testimonial-quote font-public-serif italic leading-relaxed text-public-text-dark mb-6 ${
          featured ? 'text-2xl' : 'text-xl md:text-2xl'
        }`}
      >
        {quote}
      </blockquote>

      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-11 h-11 rounded-full object-cover"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-public-accent-taupe-light text-white flex items-center justify-center font-public-serif text-xl font-semibold shrink-0">
            {initial}
          </div>
        )}
        <div>
          <strong className="block text-sm font-semibold text-public-text-dark">
            {name}
          </strong>
          {detail && (
            <span className="text-[13px] text-public-text-light">{detail}</span>
          )}
        </div>
      </div>
    </div>
  );
}
