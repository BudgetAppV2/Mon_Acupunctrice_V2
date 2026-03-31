'use client';

import { useEditorV2Store } from '@/lib/store/useEditorV2Store';
import { PRESETS } from '@/lib/editor-v2/presets';
import { PlusIcon, ArrowLeftIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

export default function TextPanel() {
  const { textOverlays, selectedOverlayId, addTextOverlay, updateTextOverlay,
    removeTextOverlay, selectOverlay, duplicateTextOverlay, duration } = useEditorV2Store();
  const sel = textOverlays.find(o => o.id === selectedOverlayId);

  if (sel) {
    const update = (changes: Partial<typeof sel>) => updateTextOverlay(sel.id, changes);
    const updateStyle = (changes: Partial<typeof sel.style>) => update({ style: { ...sel.style, ...changes } });
    return (
      <div className="px-3 py-2 space-y-2 overflow-y-auto">
        <div className="flex items-center justify-between">
          <button onClick={() => selectOverlay(null)} className="flex items-center gap-1 text-[10px] text-white/50"><ArrowLeftIcon className="w-3 h-3" /> Retour</button>
          <div className="flex gap-2">
            <button onClick={() => duplicateTextOverlay(sel.id)} className="text-[10px] text-emerald-400"><DocumentDuplicateIcon className="w-3.5 h-3.5 inline" /> Dupliquer</button>
            <button onClick={() => removeTextOverlay(sel.id)} className="text-[10px] text-red-400"><TrashIcon className="w-3.5 h-3.5 inline" /> Supprimer</button>
          </div>
        </div>
        <input value={sel.text} onChange={e => update({ text: e.target.value })} className="w-full bg-white/10 text-white text-sm rounded px-2 py-1.5" placeholder="Ton texte..." />
        {/* Presets */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {PRESETS.map(p => (
            <button key={p.id} onClick={() => updateStyle({ ...p, position: sel.style.position })}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-medium border transition ${sel.style.id === p.id ? 'border-emerald-400 bg-emerald-400/15 text-white' : 'border-white/10 text-white/50'}`}>
              {p.name}
            </button>
          ))}
        </div>
        {/* Style controls */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] text-white/40">Couleur</label>
            <input type="color" value={sel.style.color} onChange={e => updateStyle({ color: e.target.value })} className="w-full h-7 rounded bg-transparent cursor-pointer" />
          </div>
          <div>
            <label className="text-[9px] text-white/40">Fond</label>
            <input type="color" value={sel.style.bgColor ?? '#000000'} onChange={e => updateStyle({ bgColor: e.target.value })} className="w-full h-7 rounded bg-transparent cursor-pointer" />
          </div>
        </div>
        <div>
          <label className="text-[9px] text-white/40">Taille : {sel.style.fontSize}px</label>
          <input type="range" min={16} max={72} value={sel.style.fontSize} onInput={e => updateStyle({ fontSize: +(e.target as HTMLInputElement).value })} onChange={() => {}} className="w-full accent-emerald-400" />
        </div>
        {/* Timing */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] text-white/40">Debut : {(sel.startMs / 1000).toFixed(1)}s</label>
            <input type="range" min={0} max={duration} step={100} value={sel.startMs} onInput={e => update({ startMs: +(e.target as HTMLInputElement).value })} onChange={() => {}} className="w-full accent-emerald-400" />
          </div>
          <div>
            <label className="text-[9px] text-white/40">Fin : {(sel.endMs / 1000).toFixed(1)}s</label>
            <input type="range" min={0} max={duration} step={100} value={sel.endMs} onInput={e => update({ endMs: +(e.target as HTMLInputElement).value })} onChange={() => {}} className="w-full accent-emerald-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 space-y-2">
      <button onClick={() => addTextOverlay()} className="flex items-center gap-1 text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-full">
        <PlusIcon className="w-3.5 h-3.5" /> Ajouter texte
      </button>
      {textOverlays.length > 0 ? (
        <div className="space-y-1">
          {[...textOverlays].sort((a, b) => a.startMs - b.startMs).map(o => (
            <button key={o.id} onClick={() => selectOverlay(o.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left ${o.id === selectedOverlayId ? 'bg-emerald-500/20 ring-1 ring-emerald-400' : 'bg-white/5'}`}>
              <span className="text-[9px] text-white/40 w-8 shrink-0">{(o.startMs / 1000).toFixed(1)}s</span>
              <span className="text-xs text-white/70 truncate flex-1">{o.text || '(vide)'}</span>
              <span className="text-[8px] text-white/30 shrink-0" style={{ fontFamily: o.style.fontFamily }}>{o.style.name}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-white/30 text-center py-3">Aucun texte ajoute</p>
      )}
    </div>
  );
}
