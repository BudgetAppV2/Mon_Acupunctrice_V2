'use client';

import {
  FireIcon,
  StarIcon,
  TrophyIcon,
  RocketLaunchIcon,
  HeartIcon,
} from '@heroicons/react/24/solid';
import {
  FireIcon as FireOutline,
  StarIcon as StarOutline,
  TrophyIcon as TrophyOutline,
  RocketLaunchIcon as RocketOutline,
  HeartIcon as HeartOutline,
} from '@heroicons/react/24/outline';
import { MILESTONES } from '@/lib/data/milestones';

const ICON_SOLID = {
  fire: FireIcon,
  star: StarIcon,
  trophy: TrophyIcon,
  rocket: RocketLaunchIcon,
  heart: HeartIcon,
};

const ICON_OUTLINE = {
  fire: FireOutline,
  star: StarOutline,
  trophy: TrophyOutline,
  rocket: RocketOutline,
  heart: HeartOutline,
};

interface Props {
  milestones: string[];  // IDs debloques
}

export default function MilestonesList({ milestones }: Props) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-700 mb-2">Jalons</h2>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {MILESTONES.map((m) => {
          const unlocked = milestones.includes(m.id);
          const IconComponent = unlocked ? ICON_SOLID[m.icon] : ICON_OUTLINE[m.icon];
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 rounded-xl p-3 border ${
                unlocked
                  ? 'bg-white border-sage/20'
                  : 'bg-gray-50 border-gray-100 opacity-50'
              }`}
            >
              <IconComponent
                className={`w-5 h-5 shrink-0 mt-0.5 ${unlocked ? 'text-sage' : 'text-gray-400'}`}
              />
              <div className="min-w-0">
                <p className={`text-xs font-semibold ${unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                  {m.label}
                </p>
                <p className="text-[10px] text-gray-400 leading-snug">{m.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
