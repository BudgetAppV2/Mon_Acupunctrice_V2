interface WatermarkTextProps {
  text: string;
  className?: string;
  /** Opacite (defaut 0.04, max recommande 0.18) */
  opacity?: number;
}

/** Mot serif geant en filigrane. Le parent DOIT avoir position: relative.
 *  Cache sur mobile < md. */
export default function WatermarkText({
  text,
  className = '',
  opacity = 0.04,
}: WatermarkTextProps) {
  return (
    <span
      className={`absolute font-public-serif font-light italic text-public-accent-taupe pointer-events-none select-none whitespace-nowrap z-0 hidden md:block text-[120px] md:text-[200px] lg:text-[260px] ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      {text}
    </span>
  );
}
