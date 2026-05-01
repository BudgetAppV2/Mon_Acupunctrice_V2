'use client';

interface TrackedLinkProps {
  href: string;
  event: string;
  className?: string;
  target?: string;
  rel?: string;
  children: React.ReactNode;
}

/** Lien qui fire un goal Plausible au clic */
export default function TrackedLink({ href, event, className, target, rel, children }: TrackedLinkProps) {
  return (
    <a
      href={href}
      className={className}
      target={target}
      rel={rel}
      onClick={() => {
        if (typeof window !== 'undefined' && window.plausible) {
          window.plausible(event);
        }
      }}
    >
      {children}
    </a>
  );
}
