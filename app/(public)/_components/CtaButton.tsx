import Link from 'next/link';

interface CtaButtonProps {
  variant?: 'primary' | 'secondary' | 'white';
  size?: 'md' | 'lg';
  href?: string;
  sticky?: boolean;
  children: React.ReactNode;
  className?: string;
}

const BASE_PRIMARY =
  'bg-public-accent-taupe text-white rounded-md font-semibold uppercase inline-flex items-center gap-2 transition-all duration-200 hover:bg-public-accent-taupe-dark hover:-translate-y-px hover:shadow-public-md';

const SIZE_MD = 'px-[26px] py-3 text-[13px] tracking-[0.8px]';
const SIZE_LG = 'px-11 py-[18px] text-sm tracking-[1px]';

const VARIANT_SECONDARY =
  'text-public-text-medium text-sm font-medium py-4 px-2 underline underline-offset-4 decoration-1 transition-colors duration-200 hover:text-public-accent-taupe-dark inline-block';

const VARIANT_WHITE =
  'bg-white text-public-accent-taupe-dark px-12 py-5 rounded-md text-sm font-semibold tracking-[1.2px] uppercase transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.2)] inline-block';

export default function CtaButton({
  variant = 'primary',
  size = 'md',
  href = '/reserver',
  sticky = false,
  children,
  className = '',
}: CtaButtonProps) {
  let classes = '';

  if (variant === 'primary') {
    classes = `${BASE_PRIMARY} ${size === 'lg' ? SIZE_LG : SIZE_MD}`;
  } else if (variant === 'secondary') {
    classes = VARIANT_SECONDARY;
  } else {
    classes = VARIANT_WHITE;
  }

  const link = (
    <Link href={href} className={`${classes} ${className}`}>
      {children}
    </Link>
  );

  if (sticky) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <Link
          href={href}
          className={`${BASE_PRIMARY} ${SIZE_LG} w-full justify-center ${className}`}
        >
          {children}
        </Link>
      </div>
    );
  }

  return link;
}
