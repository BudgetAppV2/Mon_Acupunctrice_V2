'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';
import { TEMPLATES } from '@/lib/editor/templates';
import { XMarkIcon } from '@heroicons/react/24/outline';

const PALETTE_PREVIEW: Record<string, string[]> = {
  enseigner: ['#8A9A8A', '#3E5F4E', '#C6A769'],
  connecter: ['#E8CFCF', '#6B4F4F', '#FAF9F6'],
  aider: ['#C47A5A', '#FF6B35', '#3E5F4E'],
};

export default function TemplatePicker() {
  const { activeTemplateId, setTemplate, setTemplateTitle, setTemplatePoints, setTemplateCta } = useEditorStore();

  const handleSelect = (id: string) => {
    setTemplate(id);
    // Pre-remplir les champs par defaut
    const tpl = TEMPLATES.find(t => t.id === id);
    if (!tpl) return;
    if (id === 'enseigner') {
      setTemplateTitle('3 points pour...');
      setTemplatePoints(['Premier point', 'Deuxieme point', 'Troisieme point']);
      setTemplateCta('Enregistre pour plus tard');
    } else if (id === 'aider') {
      setTemplateTitle('Essaie ce point');
      setTemplatePoints(['Etape 1', 'Etape 2', 'Etape 3']);
      setTemplateCta('Partage a quelqu\'un');
    } else if (id === 'connecter') {
      useEditorStore.getState().setTemplateQuote('Ton texte ici...');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Templates</span>
        {activeTemplateId && (
          <button onClick={() => setTemplate(null)} className="flex items-center gap-1 text-[10px] text-gray-500">
            <XMarkIcon className="w-3 h-3" /> Retirer
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {TEMPLATES.map(tpl => {
          const colors = PALETTE_PREVIEW[tpl.id] ?? ['#888', '#555', '#ccc'];
          const isActive = activeTemplateId === tpl.id;
          return (
            <button
              key={tpl.id}
              onClick={() => handleSelect(tpl.id)}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition ${
                isActive ? 'bg-sage/20 ring-1 ring-sage' : 'bg-gray-800'
              }`}
            >
              <div className="flex gap-0.5">
                {colors.map((c, i) => (
                  <div key={i} className="w-4 h-4 rounded-full border border-gray-600" style={{ backgroundColor: c }} />
                ))}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-sage' : 'text-gray-400'}`}>
                {tpl.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
