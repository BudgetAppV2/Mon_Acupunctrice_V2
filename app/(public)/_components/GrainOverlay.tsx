interface GrainOverlayProps {
  children: React.ReactNode;
  className?: string;
}

/** Wrapper qui applique un bruit papier via la classe CSS .public-grain (globals-public.css). */
export default function GrainOverlay({
  children,
  className = '',
}: GrainOverlayProps) {
  return (
    <div className={`public-grain relative ${className}`}>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
