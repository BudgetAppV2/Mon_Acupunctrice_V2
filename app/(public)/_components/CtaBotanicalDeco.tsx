/**
 * Filigrane botanique pour les sections CTA.
 * Pattern : plant.webp en mix-blend-mode screen (gauche + miroir droite) sur fond taupe.
 * Usage : <CtaBotanicalDeco /> a l'interieur d'une section avec `relative overflow-hidden`.
 */
export default function CtaBotanicalDeco() {
  return (
    <>
      {/* Gauche */}
      <div
        className="absolute top-[20px] left-[-80px] w-[30%] h-full pointer-events-none z-0 hidden md:block overflow-hidden"
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/site/svg/plant.webp"
          alt=""
          loading="lazy"
          className="w-full h-full object-cover object-center"
          style={{ mixBlendMode: 'screen', transform: 'scale(2.2)', transformOrigin: 'center center', opacity: 0.55 }}
        />
      </div>
      {/* Droite (miroir) */}
      <div
        className="absolute top-[20px] right-[-80px] w-[30%] h-full pointer-events-none z-0 hidden md:block overflow-hidden"
        aria-hidden="true"
        style={{ transform: 'scaleX(-1)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/site/svg/plant.webp"
          alt=""
          loading="lazy"
          className="w-full h-full object-cover object-center"
          style={{ mixBlendMode: 'screen', transform: 'scale(2.2)', transformOrigin: 'center center', opacity: 0.55 }}
        />
      </div>
    </>
  );
}
