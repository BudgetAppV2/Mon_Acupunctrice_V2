interface PaperTextureProps {
  children: React.ReactNode;
  className?: string;
  /** Intensite de la texture (0.0 a 1.0). Defaut : 0.40 */
  opacity?: number;
  /** 'synthetic' = SVG noise inline (defaut, leger).
   *  'real' = texture papier japonais photographiee (fichiers dans public/site/textures/). */
  variant?: 'synthetic' | 'real';
}

const SYNTHETIC_BG =
  'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'p\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.45\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23p)\'/%3E%3C/svg%3E")';

const REAL_BG =
  'image-set(url("/site/textures/paper-japan.avif") type("image/avif"), url("/site/textures/paper-japan.webp") type("image/webp"), url("/site/textures/paper-japan.jpg") type("image/jpeg"))';

/** Wrapper qui applique une texture papier en overlay.
 *  - variant='synthetic' : SVG noise inline (leger, pas de requete HTTP)
 *  - variant='real' : texture papier japonais photographiee via image-set() CSS */
export default function PaperTexture({
  children,
  className = '',
  opacity = 0.4,
  variant = 'synthetic',
}: PaperTextureProps) {
  const isReal = variant === 'real';

  return (
    <div className={`relative ${className}`}>
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          opacity,
          mixBlendMode: 'multiply',
          backgroundImage: isReal ? REAL_BG : SYNTHETIC_BG,
          backgroundSize: isReal ? 'cover' : '400px 400px',
          backgroundRepeat: isReal ? 'no-repeat' : undefined,
        }}
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
