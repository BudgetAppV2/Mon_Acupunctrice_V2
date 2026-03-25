'use client';

import { useState, useEffect, useMemo } from 'react';
import { DocumentDuplicateIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { getStyleLabel, getStyleBg } from '@/lib/utils/contentStyles';
import { REFLECTION_PROMPTS, TEMPLATES } from '@/lib/data/templates';
import type { ContentStyle } from '@/lib/types';

interface Props {
  selectedStyle: ContentStyle | 'all';
}

export default function TemplateList({ selectedStyle }: Props) {
  const [aiQuestions, setAiQuestions] = useState<{ text: string; style?: ContentStyle }[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showHooks, setShowHooks] = useState(false);

  // Reset les suggestions IA quand on change de filtre
  useEffect(() => {
    setAiQuestions([]);
  }, [selectedStyle]);

  // Questions de réflexion filtrées
  const reflections = useMemo(() => {
    const pool = selectedStyle === 'all'
      ? REFLECTION_PROMPTS
      : REFLECTION_PROMPTS.filter((p) => p.style === selectedStyle);
    return pool;
  }, [selectedStyle]);

  // Hooks originaux filtrés
  const hooks = useMemo(() => {
    return selectedStyle === 'all'
      ? TEMPLATES.filter((t) => t.category === 'hook')
      : TEMPLATES.filter((t) => t.category === 'hook' && t.style === selectedStyle);
  }, [selectedStyle]);

  const structures = useMemo(() => {
    return selectedStyle === 'all'
      ? TEMPLATES.filter((t) => t.category === 'caption_structure')
      : TEMPLATES.filter((t) => t.category === 'caption_structure' && t.style === selectedStyle);
  }, [selectedStyle]);

  // Appel Claude pour remplacer TOUTES les suggestions
  const handleRefresh = async () => {
    const styleLabel = selectedStyle === 'all' ? 'varié' : getStyleLabel(selectedStyle as ContentStyle);
    const count = selectedStyle === 'all' ? 8 : 4;
    setLoadingAi(true);
    try {
      const styles = selectedStyle === 'all'
        ? 'Génère 2 questions par style (Enseigner, Connecter, Aider, Inspirer), 8 au total. Mets le nom du style entre crochets au début de chaque question, ex: [Enseigner] Quelle question...'
        : `Génère exactement ${count} questions pour le style "${styleLabel}".`;

      const res = await fetch('/api/generate-caption-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Questions de réflexion ${styleLabel}`,
          category: 'inspiration',
          platform: 'instagram',
          contentStyle: selectedStyle === 'all' ? 'enseigner' : selectedStyle,
          captionDraft: `Tu aides une acupunctrice québécoise à trouver des sujets de contenu pour ses réseaux sociaux. ${styles} Les questions doivent l'aider à puiser dans SON vécu et SA pratique — pas des formules marketing pré-faites. Chaque question doit sonner comme une question qu'une amie ou coach bienveillante poserait. Donne SEULEMENT les questions, une par ligne, sans numéro ni tiret.`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const lines = (data.caption as string)
          .split('\n')
          .map((l: string) => l.trim())
          .filter((l: string) => l.length > 10);

        const parsed = lines.map((line: string) => {
          // Extraire le style si format [Style] Question...
          const match = line.match(/^\[(\w+)\]\s*(.+)/);
          if (match) {
            const styleMap: Record<string, ContentStyle> = {
              Enseigner: 'enseigner', Connecter: 'connecter',
              Aider: 'aider', Inspirer: 'inspirer',
            };
            return { text: match[2], style: styleMap[match[1]] };
          }
          return { text: line, style: selectedStyle === 'all' ? undefined : selectedStyle as ContentStyle };
        });

        setAiQuestions(parsed);
      }
    } catch { /* silencieux */ }
    setLoadingAi(false);
  };

  // Ce qu'on affiche : IA si dispo, sinon statiques
  const showingAi = aiQuestions.length > 0;
  const displayCards = showingAi
    ? aiQuestions
    : reflections.map((p) => ({ text: p.question, style: p.style }));

  return (
    <div className="space-y-6 px-4">
      {/* Section principale : Questions de réflexion */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Pense à...
          </h2>
          <button
            onClick={showingAi ? () => setAiQuestions([]) : handleRefresh}
            disabled={loadingAi}
            className="flex items-center gap-1 text-xs text-sage hover:text-sage/80 disabled:opacity-40 transition-colors"
          >
            <ArrowPathIcon className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
            {loadingAi ? 'Génération...' : showingAi ? 'Revenir aux classiques' : 'Nouvelles suggestions'}
          </button>
        </div>

        <div className="space-y-2">
          {displayCards.map((item, i) => (
            <CopyableCard key={`${showingAi ? 'ai' : 'static'}-${i}`} text={item.text} style={item.style} />
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

// --- CopyableCard --- même style pour toutes les cartes

function CopyableCard({ text, style }: { text: string; style?: ContentStyle }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const label = style ? getStyleLabel(style) : undefined;
  const bg = style ? getStyleBg(style) : 'bg-gray-50 text-gray-500';

  return (
    <div className="flex items-start gap-3 py-3 px-3.5 rounded-xl bg-white border border-gray-100">
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
