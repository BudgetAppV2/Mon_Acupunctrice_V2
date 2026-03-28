'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';
import { TEMPLATES } from '@/lib/editor/templates';
import { loadFont } from '@/lib/utils/fontLoader';
import { XMarkIcon } from '@heroicons/react/24/outline';

const PALETTE_PREVIEW: Record<string, string[]> = {
  enseigner: ['#8A9A8A', '#3E5F4E', '#C6A769'],
  connecter: ['#E8CFCF', '#6B4F4F', '#FAF9F6'],
  aider: ['#C47A5A', '#FF6B35', '#3E5F4E'],
};

export default function TemplatePicker() {
  const { activeTemplateId, duration, setTemplate, setActiveTheme, setSubtitleStyle,
    setOverlays, setTemplateTitle, setTemplatePoints, setTemplateCta, setTemplateQuote } = useEditorStore();

  const handleSelect = (id: string) => {
    const tpl = TEMPLATES.find(t => t.id === id);
    if (!tpl) return;
    setTemplate(id);

    // Appliquer le theme du template
    loadFont(tpl.fonts.title); loadFont(tpl.fonts.body);
    setActiveTheme(tpl.id === 'enseigner' ? 'sage_zen' : tpl.id === 'aider' ? 'bold_energy' : 'terre_warm');
    setSubtitleStyle(tpl.subtitleFamily === 'narratif' ? 'pill' : tpl.subtitleFamily === 'boldHighlight' ? 'bold_outline' : 'classic');

    // Generer les overlays dans le store pour le preview temps reel
    const d = duration || 30;
    if (id === 'enseigner') {
      const pts = ['Premier point', 'Deuxieme point', 'Troisieme point'];
      setTemplateTitle('3 points pour...'); setTemplatePoints(pts); setTemplateCta('Enregistre pour plus tard');
      const segDur = (d * 0.7) / pts.length;
      setOverlays([
        { id: 'tpl_title', text: '3 points pour...', fontFamily: tpl.fonts.title, fontSize: 36, fill: '#ffffff', x: 0.5, y: 0.15, startTime: 0, endTime: d * 0.12, style: 'classic' as const, animation: 'scale_pop' as const },
        ...pts.map((pt, i) => ({ id: `tpl_pt_${i}`, text: `${i + 1}.  ${pt}`, fontFamily: tpl.fonts.body, fontSize: 24, fill: '#3E5F4E', x: 0.5, y: 0.65, startTime: d * 0.15 + i * segDur, endTime: d * 0.15 + (i + 1) * segDur, style: 'classic' as const, animation: 'slide_up' as const })),
      ]);
    } else if (id === 'aider') {
      const pts = ['Etape 1', 'Etape 2', 'Etape 3'];
      setTemplateTitle('Essaie ce point'); setTemplatePoints(pts); setTemplateCta('Partage');
      const segDur = (d * 0.7) / pts.length;
      setOverlays([
        { id: 'tpl_hook', text: 'ESSAIE CE POINT', fontFamily: tpl.fonts.title, fontSize: 40, fill: '#ffffff', x: 0.5, y: 0.25, startTime: 0, endTime: d * 0.12, style: 'classic' as const, animation: 'scale_pop' as const },
        ...pts.map((pt, i) => ({ id: `tpl_pt_${i}`, text: pt.toUpperCase(), fontFamily: tpl.fonts.title, fontSize: 32, fill: '#ffffff', x: 0.5, y: 0.5, startTime: d * 0.15 + i * segDur, endTime: d * 0.15 + (i + 1) * segDur, style: 'classic' as const, animation: 'scale_pop' as const })),
      ]);
    } else if (id === 'connecter') {
      setTemplateQuote('Ton texte ici...');
      setOverlays([
        { id: 'tpl_quote', text: '\u201CTon texte ici...\u201D', fontFamily: tpl.fonts.title, fontSize: 28, fill: '#ffffff', x: 0.5, y: 0.35, startTime: d * 0.1, endTime: d * 0.7, style: 'classic' as const, animation: 'fade' as const },
      ]);
    }
  };

  const handleRemove = () => { setTemplate(null); setOverlays([]); };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Templates</span>
        {activeTemplateId && (
          <button onClick={handleRemove} className="flex items-center gap-1 text-[10px] text-gray-500">
            <XMarkIcon className="w-3 h-3" /> Retirer
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {TEMPLATES.map(tpl => {
          const colors = PALETTE_PREVIEW[tpl.id] ?? ['#888', '#555', '#ccc'];
          const isActive = activeTemplateId === tpl.id;
          return (
            <button key={tpl.id} onClick={() => handleSelect(tpl.id)}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition ${isActive ? 'bg-sage/20 ring-1 ring-sage' : 'bg-gray-800'}`}>
              <div className="flex gap-0.5">
                {colors.map((c, i) => <div key={i} className="w-4 h-4 rounded-full border border-gray-600" style={{ backgroundColor: c }} />)}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-sage' : 'text-gray-400'}`}>{tpl.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
