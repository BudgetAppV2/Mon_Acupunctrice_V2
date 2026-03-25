'use client';

import { useState, useMemo } from 'react';
import { LightBulbIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { REFLECTION_PROMPTS } from '@/lib/data/templates';
import { getStyleBg, getStyleLabel } from '@/lib/utils/contentStyles';
import type { ContentStyle } from '@/lib/types';

interface Props {
  style?: ContentStyle;
  onUsePrompt?: (question: string) => void;
}

/** Affiche 2-3 questions de réflexion adaptées au style sélectionné.
 *  Discret : un lien "Besoin d'inspiration?" qui expand les suggestions. */
export default function InspirationHint({ style, onUsePrompt }: Props) {
  const [open, setOpen] = useState(false);
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [seed, setSeed] = useState(0);

  // Sélectionne 2 questions (re-shuffle quand seed change)
  const prompts = useMemo(() => {
    if (!style) return [];
    const pool = REFLECTION_PROMPTS.filter((p) => p.style === style);
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style, seed]);

  const handleRefresh = async () => {
    if (!style) return;
    setLoadingAi(true);
    setAiQuestions([]);
    try {
      const res = await fetch('/api/generate-caption-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Questions de réflexion pour contenu ${getStyleLabel(style)}`,
          category: 'inspiration',
          platform: 'instagram',
          contentStyle: style,
          captionDraft: `Génère exactement 2 questions de réflexion pour une acupunctrice québécoise qui cherche un sujet de contenu de style "${getStyleLabel(style)}". Les questions doivent l'aider à puiser dans SON vécu et SA pratique — pas des formules marketing. Donne SEULEMENT les 2 questions, une par ligne, sans numéro ni tiret.`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const lines = (data.caption as string)
          .split('\n')
          .map((l: string) => l.trim())
          .filter((l: string) => l.length > 10);
        setAiQuestions(lines.slice(0, 2));
      }
    } catch { /* silencieux */ }
    setLoadingAi(false);
  };

  const handleShuffleStatic = () => {
    setSeed((s) => s + 1);
    setAiQuestions([]);
  };

  if (!style || prompts.length === 0) return null;

  const displayQuestions = aiQuestions.length > 0 ? aiQuestions : prompts.map((p) => p.question);

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
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Pense à...</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShuffleStatic}
                className="text-[10px] text-gray-400 hover:text-gray-500"
              >
                Autres
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loadingAi}
                className="flex items-center gap-0.5 text-[10px] text-sage hover:text-sage/80 disabled:opacity-40"
              >
                <ArrowPathIcon className={`w-3 h-3 ${loadingAi ? 'animate-spin' : ''}`} />
                IA
              </button>
            </div>
          </div>
          {displayQuestions.map((q, i) => (
            <button
              key={`${q}-${i}`}
              type="button"
              onClick={() => onUsePrompt?.(q)}
              className={`block w-full text-left text-xs px-3 py-2 rounded-lg border transition-colors ${
                aiQuestions.length > 0
                  ? 'bg-sage/5 border-sage/20 hover:border-sage/40'
                  : `border-gray-100 hover:border-sage/30 ${getStyleBg(style)}`
              }`}
            >
              {q}
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setOpen(false); setAiQuestions([]); }}
            className="text-[10px] text-gray-400 hover:text-gray-500"
          >
            Masquer
          </button>
        </div>
      )}
    </div>
  );
}
