interface SectionNumberProps {
  number: string;
  align?: 'left' | 'center';
  className?: string;
}

/** Numero de section decoratif en serif italique geant. Dans le flow, pas absolute. */
export default function SectionNumber({
  number,
  align = 'center',
  className = '',
}: SectionNumberProps) {
  return (
    <div
      className={`font-public-serif text-[80px] md:text-[140px] font-light italic text-public-accent-warm opacity-[0.18] leading-none tracking-tight mb-[-18px] md:mb-[-30px] relative z-0 ${
        align === 'center' ? 'text-center' : 'text-left'
      } ${className}`}
      aria-hidden="true"
    >
      {number}
    </div>
  );
}
