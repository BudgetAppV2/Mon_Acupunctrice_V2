'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function TemplateCustomizer() {
  const { activeTemplateId, templateTitle, templatePoints, templateQuote, templateCta,
    setTemplateTitle, setTemplatePoints, setTemplateCta, setTemplateQuote } = useEditorStore();

  if (!activeTemplateId) return null;

  const isPointsBased = activeTemplateId === 'enseigner' || activeTemplateId === 'aider';
  const isQuoteBased = activeTemplateId === 'connecter';

  const updatePoint = (idx: number, val: string) => {
    const pts = [...templatePoints]; pts[idx] = val; setTemplatePoints(pts);
  };
  const addPoint = () => setTemplatePoints([...templatePoints, `Point ${templatePoints.length + 1}`]);
  const removePoint = (idx: number) => setTemplatePoints(templatePoints.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2 border-t border-gray-800 pt-2">
      <span className="text-xs text-gray-400">Personnaliser</span>

      <div>
        <label className="text-[10px] text-gray-500">Titre</label>
        <input value={templateTitle} onChange={e => setTemplateTitle(e.target.value)}
          className="w-full bg-gray-800 text-white text-xs rounded px-2 py-1.5" placeholder="Ton titre..." />
      </div>

      {isPointsBased && (
        <div className="space-y-1">
          <label className="text-[10px] text-gray-500">Points</label>
          {templatePoints.map((pt, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="text-[10px] text-gray-600 w-4 shrink-0">{i + 1}.</span>
              <input value={pt} onChange={e => updatePoint(i, e.target.value)}
                className="flex-1 bg-gray-800 text-white text-xs rounded px-2 py-1" />
              <button onClick={() => removePoint(i)} className="text-gray-600 p-0.5"><TrashIcon className="w-3 h-3" /></button>
            </div>
          ))}
          {templatePoints.length < 5 && (
            <button onClick={addPoint} className="flex items-center gap-1 text-[10px] text-sage">
              <PlusIcon className="w-3 h-3" /> Ajouter
            </button>
          )}
        </div>
      )}

      {isQuoteBased && (
        <div>
          <label className="text-[10px] text-gray-500">Citation</label>
          <textarea value={templateQuote} onChange={e => setTemplateQuote(e.target.value)}
            className="w-full bg-gray-800 text-white text-xs rounded px-2 py-1.5 h-16 resize-none" placeholder="Ta citation..." />
        </div>
      )}

      <div>
        <label className="text-[10px] text-gray-500">CTA (optionnel)</label>
        <input value={templateCta} onChange={e => setTemplateCta(e.target.value)}
          className="w-full bg-gray-800 text-white text-xs rounded px-2 py-1.5" placeholder="Enregistre pour plus tard" />
      </div>
    </div>
  );
}
