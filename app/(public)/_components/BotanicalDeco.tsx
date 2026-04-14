const POSITION_CLASSES = {
  'top-left': 'top-0 left-0',
  'top-right': 'top-0 right-0',
  'bottom-left': 'bottom-0 left-0',
  'bottom-right': 'bottom-0 right-0',
} as const;

interface BotanicalDecoProps {
  /** SVG inline passe en children */
  children: React.ReactNode;
  position: keyof typeof POSITION_CLASSES;
  className?: string;
  /** Opacite du SVG. Defaut : 0.12 */
  opacity?: number;
  /** Taille en pixels. Defaut : 200 */
  size?: number;
}

/** Positionne un SVG decoratif en arriere-plan avec mix-blend-mode multiply.
 *  Le parent DOIT avoir position: relative. Cache sur mobile. */
export default function BotanicalDeco({
  children,
  position,
  className = '',
  opacity = 0.12,
  size = 200,
}: BotanicalDecoProps) {
  return (
    <div
      className={`absolute ${POSITION_CLASSES[position]} pointer-events-none z-0 hidden md:block ${className}`}
      style={{ opacity, width: size, height: size, mixBlendMode: 'multiply' }}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}
