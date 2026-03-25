'use client';

import { useState } from 'react';
import { DocumentDuplicateIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { getStyleColor, getStyleLabel, getStyleBg } from '@/lib/utils/contentStyles';
import { REFLECTION_PROMPTS, TEMPLATES } from '@/lib/data/templates';
import type { ContentStyle } from '@/lib/types';

interface Props {
  selectedStyle: ContentStyle | 'all';
}

export default function TemplateList({ selectedStyle }: Props) {
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showHooks, setShowHooks] = useState(false);

  // Questions de réflexion filtrées
  const reflections = selectedStyle === 'all'
    ? REFLECTION_PROMPTS
    : REFLECTION_PROMPTS.filter((p) => p.style === selectedStyle);

  // Hooks originaux filtrés
  const hooks = selectedStyle === 'all'
    ? TEMPLATES.filter((t) => t.category === 'hook')
    : TEMPLATES.filter((t) => t.category === 'hook' && t.style === selectedStyle);

  const structures = selectedStyle === 'all'
    ? TEMPLATES.filter((t) => t.category === 'caption_structure')
    : TEMPLATES.filter((t) => t.category === 'caption_structure' && t.style === selectedStyle);

  // Appel Claude pour des suggestions fraîches
  const handleRefresh = async () => {
    const styleLabel = selectedStyle === 'all' ? 'varié' : getStyleLabel(selectedStyle as ContentStyle);
    setLoadingAi(true);
    setAiSuggestions([]);
    try {
      const res = await fetch('/api/generate-caption-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Suggestions de réflexion pour du contenu de style ${styleLabel}`,
          category: 'inspiration',
          platform: 'instagram',
          contentStyle: selectedStyle === 'all' ? 'enseigner' : selectedStyle,
          captionDraft: `Génère exactement 3 questions de réflexion pour une acupunctrice qui crée du contenu de style "${styleLabel}". Les questions doivent l'aider à trouver SON sujet, pas lui donner une formule. Donne SEULEMENT les 3 questions, une par ligne, sans numéro ni tiret.`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const lines = (data.caption as string)
          .split('\n')
          .map((l: string) => l.trim())
          .filter((l: string) => l.length > 10 && l.endsWith('?'));
        setAiSuggestions(lines.slice(0, 3));
      }
    } catch { /* silencieux */ }
    setLoadingAi(false);
  };

  return (
    <div className="space-y-6 px-4">
      {/* Section 1 : Questions de réflexion */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Pense à...
          </h2>
          <button
            onClick={handleRefresh}
            disabled={loadingAi}
            className="flex items-center gap-1 text-xs text-sage hover:text-sage/80 disabled:opacity-40 transition-colors"
          >
            <ArrowPathIcon className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
            Nouvelles suggestions
          </button>
        </div>

        <div className="space-y-2">
          {/* Suggestions IA si disponibles */}
          {aiSuggestions.map((q, i) => (
            <CopyableCard key={`ai-${i}`} text={q} style={selectedStyle === 'all' ? undefined : selectedStyle as ContentStyle} isAi />
          ))}

          {/* Questions de réflexion statiques */}
          {reflections.map((p) => (
            <CopyableCard key={p.id} text={p.question} style={p.style} />
          ))}
        </div>
      </section>

      {/* Section 2 : Formules de hooks (expandable) */}
      {hooks.length > 0 && (
        <section>
          <button
            onClick={() => setShowHooks(!showHooks)}
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-500 mb-3"
          >
            {showHooks ? '▾' : '▸'} Formules de hooks ({hooks.length})
          </button>

          {showHooks && (
            <div className="space-y-2">
              {hooks.map((t) => (
                <CopyableCard key={t.id} text={t.text} style={t.style} />
              ))}
              {structures.length > 0 && (
                <>
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-gray-300 mt-4 mb-2">
                    Structures de captions
                  </h3>
                  {structures.map((t) => (
                    <CopyableCard key={t.id} text={t.text} style={t.style} />
                  ))}
                </>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

// --- CopyableCard ---

function CopyableCard({ text, style, isAi }: { text: string; style?: ContentStyle; isAi?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const label = style ? getStyleLabel(style) : undefined;
  const bg = style ? getStyleBg(style) : 'bg-gray-50 text-gray-600';

  return (
    <div className={`flex items-start gap-3 py-3 px-3.5 rounded-xl border transition-colors ${
      isAi ? 'bg-sage/5 border-sage/20' : 'bg-white border-gray-100'
    }`}>
      {label && (
        <span className={`mt-0.5 shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${bg}`}>
          {label}
        </span>
      )}
      <p className="flex-1 text-sm text-gray-700 leading-snug">{text}</p>
      <button
        onClick={handleCopy}
        aria-label="Copier"
        className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
      >
        {copied
          ? <CheckIcon className="w-4 h-4 text-sage" />
          : <DocumentDuplicateIcon className="w-4 h-4" />
        }
      </button>
    </div>
  );
}
