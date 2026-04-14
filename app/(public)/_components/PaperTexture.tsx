interface PaperTextureProps {
  children: React.ReactNode;
  className?: string;
  /** Intensite de la texture (0.0 a 1.0). Defaut : 0.40 */
  opacity?: number;
}

/** Wrapper qui applique une texture papier japonais en overlay SVG inline. */
export default function PaperTexture({
  children,
  className = '',
  opacity = 0.4,
}: PaperTextureProps) {
  return (
    <div className={`relative ${className}`}>
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          opacity,
          mixBlendMode: 'multiply',
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'p\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.45\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23p)\'/%3E%3C/svg%3E")',
          backgroundSize: '400px 400px',
        }}
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
