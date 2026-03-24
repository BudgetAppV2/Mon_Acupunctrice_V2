'use client';

// Cercle de progression style Apple Watch — affiche X/Y publications de la semaine
interface Props {
  completed: number;
  total: number;
}

const RADIUS = 15;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ProgressionCircle({ completed, total }: Props) {
  const progress = total === 0 ? 0 : Math.min(completed / total, 1);
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const strokeColor =
    progress === 0 ? '#D1D5DB' :
    progress >= 1 ? '#22c55e' :
    '#5C7A5F'; // sage

  return (
    <svg viewBox="0 0 36 36" width={48} height={48} className="shrink-0">
      {/* Piste de fond */}
      <circle cx="18" cy="18" r={RADIUS} fill="none" stroke="#E5E7EB" strokeWidth="3" />
      {/* Arc de progression */}
      <circle
        cx="18" cy="18" r={RADIUS}
        fill="none"
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={dashOffset}
        transform="rotate(-90 18 18)"
        style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.3s ease' }}
      />
      {/* Texte X/Y au centre */}
      <text x="18" y="18" textAnchor="middle" dominantBaseline="central" fontSize="7" fontWeight="600" fill="#374151">
        {completed}/{total}
      </text>
    </svg>
  );
}
