'use client';

import { useState, useMemo } from 'react';
import { LightBulbIcon } from '@heroicons/react/24/outline';
import { REFLECTION_PROMPTS } from '@/lib/data/templates';
import { getStyleBg } from '@/lib/utils/contentStyles';
import type { ContentStyle } from '@/lib/types';

interface Props {
  style?: ContentStyle;
  onUsePrompt?: (question: string) => void;
}

/** Affiche 2-3 questions de réflexion adaptées au style sélectionné.
 *  Discret : un lien "Besoin d'inspiration?" qui expand les suggestions. */
export default function InspirationHint({ style, onUsePrompt }: Props) {
  const [open, setOpen] = useState(false);

  // Sélectionne 2 questions aléatoires (stable par style)
  const prompts = useMemo(() => {
    if (!style) return [];
    const pool = REFLECTION_PROMPTS.filter((p) => p.style === style);
    // Prend 2 questions — shuffle déterministe basé sur le style
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  }, [style]);

  if (!style || prompts.length === 0) return null;

  return (
    <div className="mt-1">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-sage transition-colors"
        >
          <LightBulbIcon className="w-3.5 h-3.5" />
          <span>Besoin d'inspiration?</span>
        </button>
      ) : (
        <div className="space-y-1.5 animate-fade-in">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Pense à...</p>
          {prompts.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onUsePrompt?.(p.question)}
              className={`block w-full text-left text-xs px-3 py-2 rounded-lg border border-gray-100 hover:border-sage/30 transition-colors ${getStyleBg(style)}`}
            >
              {p.question}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-[10px] text-gray-400 hover:text-gray-500"
          >
            Masquer
          </button>
        </div>
      )}
    </div>
  );
}
