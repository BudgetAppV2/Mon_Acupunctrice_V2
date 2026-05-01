const GOOGLE_MAPS_URL =
  'https://maps.google.com/?q=La+Source+en+Soi+Rosemont+Montreal';

interface ClinicBadgeProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export default function ClinicBadge({
  variant = 'full',
  className = '',
}: ClinicBadgeProps) {
  if (variant === 'compact') {
    return (
      <a
        href={GOOGLE_MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-sm text-public-text-medium hover:text-public-accent-taupe-dark transition-colors ${className}`}
      >
        La Source en Soi{' '}
        <span aria-hidden="true">·</span> 4,9/5
      </a>
    );
  }

  return (
    <a
      href={GOOGLE_MAPS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-full border border-public-border-subtle bg-public-beige-light px-5 py-3 font-public-sans text-sm text-public-text-medium shadow-public-sm hover:shadow-public-md transition-shadow ${className}`}
    >
      <span className="font-semibold text-public-accent-taupe-dark">
        La Source en Soi
      </span>
      <span aria-hidden="true">·</span>
      <span>4,9 / 5 — 1 200+ avis Google</span>
    </a>
  );
}
