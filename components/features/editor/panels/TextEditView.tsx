'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';
import type { TextOverlayItem, TextStylePreset, TextAnimation } from '@/lib/types';
import FontSelector from '../text/FontSelector';
import StyleSelector from '../text/StyleSelector';
import AnimationSelector from '../text/AnimationSelector';
import { PlusIcon, TrashIcon, ArrowLeftIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

interface Props { overlay: TextOverlayItem }

export default function TextEditView({ overlay }: Props) {
  const { addOverlay, updateOverlay, removeOverlay, duplicateOverlay, selectOverlay, duration } = useEditorStore();

  const update = (changes: Partial<TextOverlayItem>) => updateOverlay(overlay.id, changes);

  return (
    <div className="px-3 py-2 space-y-2 overflow-y-auto bg-gray-900 rounded-t-xl">
      <div className="flex items-center justify-between">
        <button onClick={() => selectOverlay(null)} className="flex items-center gap-1 text-xs text-gray-400">
          <ArrowLeftIcon className="w-3 h-3" /> Retour
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => addOverlay()} className="flex items-center gap-1 text-xs bg-sage text-white px-2 py-1 rounded-full">
            <PlusIcon className="w-3 h-3" /> Nouveau
          </button>
          <button onClick={() => duplicateOverlay(overlay.id)} className="flex items-center gap-1 text-xs text-sage">
            <DocumentDuplicateIcon className="w-3 h-3" /> Dupliquer
          </button>
          <button onClick={() => removeOverlay(overlay.id)} className="flex items-center gap-1 text-xs text-red-400">
            <TrashIcon className="w-3 h-3" /> Supprimer
          </button>
        </div>
      </div>

      <input
        value={overlay.text}
        onChange={e => update({ text: e.target.value })}
        className="w-full bg-gray-800 text-white text-sm rounded px-2 py-1.5"
        placeholder="Ton texte..."
      />

      <FontSelector value={overlay.fontFamily} onChange={v => update({ fontFamily: v })} />

      <div>
        <label className="text-xs text-gray-500">Taille : {overlay.fontSize}px</label>
        <input type="range" min={12} max={72} value={overlay.fontSize} onChange={e => update({ fontSize: +e.target.value })} className="w-full accent-sage" />
      </div>

      <StyleSelector value={overlay.style} onChange={(id, props) => update({ style: id as TextStylePreset, ...props })} />
      <AnimationSelector value={overlay.animation} onChange={v => update({ animation: v as TextAnimation })} />

      <div>
        <label className="text-xs text-gray-500">Effet</label>
        <div className="flex gap-1 mt-0.5">
          {([['none', 'Aucun'], ['outline', 'Contour'], ['double_outline', 'Double'], ['glow', 'Glow'], ['pill', 'Pill']] as const).map(([eff, label]) => (
            <button
              key={eff}
              onClick={() => update({ effect: eff })}
              className={`px-2 py-1 rounded text-[10px] font-medium transition ${
                (overlay.effect ?? 'none') === eff ? 'bg-sage/20 ring-1 ring-sage text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500">Debut : {overlay.startTime.toFixed(1)}s</label>
          <input type="range" min={0} max={duration} step={0.1} value={overlay.startTime} onChange={e => update({ startTime: +e.target.value })} className="w-full accent-sage" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Fin : {overlay.endTime.toFixed(1)}s</label>
          <input type="range" min={0} max={duration} step={0.1} value={overlay.endTime} onChange={e => update({ endTime: +e.target.value })} className="w-full accent-sage" />
        </div>
      </div>
    </div>
  );
}
