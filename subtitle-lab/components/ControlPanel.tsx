'use client';

import { useSubtitleStore } from '../lib/store';
import type { StylePreset } from '../lib/types';
import { ANIMATION_TYPES, FONT_FAMILIES } from '../lib/controlOptions';

export default function ControlPanel() {
  const { globalPreset, updateGlobalField, applyGlobalToAll, blocks, selectedBlockId, updateBlock, resetBlockOverrides } = useSubtitleStore();

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) ?? null;
  const effectiveStyle: StylePreset = selectedBlock
    ? { ...globalPreset, ...(selectedBlock.overrides ?? {}) }
    : globalPreset;
  const isBlockSelected = selectedBlock !== null;

  const setField = <K extends keyof StylePreset>(key: K, value: StylePreset[K]) => {
    if (isBlockSelected && selectedBlockId) {
      updateBlock(selectedBlockId, { [key]: value } as Partial<StylePreset>);
    } else {
      updateGlobalField(key, value);
    }
  };

  return (
    <div className="px-3 py-2 space-y-3">
      {/* Context header */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
          {isBlockSelected ? 'Bloc sélectionné' : 'Style global'}
        </p>
        {isBlockSelected && (
          <button onClick={() => resetBlockOverrides(selectedBlockId!)}
            className="text-[10px] text-white/40 active:text-white/80 underline underline-offset-2">Reset</button>
        )}
      </div>

      {/* Font + Animation — two selects side by side */}
      <div className="grid grid-cols-2 gap-2">
        <Row label="Police">
          <select value={effectiveStyle.fontFamily} onChange={(e) => setField('fontFamily', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-1.5 py-1 text-[11px] text-white/80 focus:outline-none">
            {FONT_FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </Row>
        <Row label="Animation">
          <select value={effectiveStyle.animation.type}
            onChange={(e) => setField('animation', { ...effectiveStyle.animation, type: e.target.value as StylePreset['animation']['type'] })}
            className="w-full bg-white/5 border border-white/10 rounded px-1.5 py-1 text-[11px] text-white/80 focus:outline-none">
            {ANIMATION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Row>
      </div>

      {/* Size */}
      <Row label={`Taille ${effectiveStyle.fontSize}px`}>
        <input type="range" min={16} max={60} value={effectiveStyle.fontSize}
          onChange={(e) => setField('fontSize', Number(e.target.value))} className="w-full accent-emerald-400 h-1.5" />
      </Row>

      {/* Colors row — text, bg, outline, shadow in one line */}
      <div className="flex items-center gap-3">
        <ColorSwatch label="Texte" value={effectiveStyle.color} onChange={(v) => setField('color', v)} />
        <ColorSwatch label="Fond" value={effectiveStyle.bgColor ?? '#000000'} onChange={(v) => setField('bgColor', v)}
          onClear={() => setField('bgColor', undefined)} />
        <ColorSwatch label="Contour" value={effectiveStyle.outlineColor ?? '#000000'} onChange={(v) => setField('outlineColor', v)} />
        <ColorSwatch label="Ombre" value={toHex(effectiveStyle.shadowColor ?? '#000000')} onChange={(v) => setField('shadowColor', v)} />
      </div>

      {/* Outline width + Shadow blur side by side */}
      <div className="grid grid-cols-2 gap-2">
        <Row label={`Contour ${effectiveStyle.outlineWidth ?? 0}px`}>
          <input type="range" min={0} max={8} value={effectiveStyle.outlineWidth ?? 0}
            onChange={(e) => setField('outlineWidth', Number(e.target.value))} className="w-full accent-emerald-400 h-1.5" />
        </Row>
        <Row label={`Ombre ${effectiveStyle.shadowBlur ?? 0}px`}>
          <input type="range" min={0} max={40} value={effectiveStyle.shadowBlur ?? 0}
            onChange={(e) => setField('shadowBlur', Number(e.target.value))} className="w-full accent-emerald-400 h-1.5" />
        </Row>
      </div>

      {/* Letter spacing + casse */}
      <div className="grid grid-cols-2 gap-2">
        <Row label={`Espacement ${effectiveStyle.letterSpacing ?? 0}`}>
          <input type="range" min={-2} max={12} step={0.5} value={effectiveStyle.letterSpacing ?? 0}
            onChange={(e) => setField('letterSpacing', Number(e.target.value))} className="w-full accent-emerald-400 h-1.5" />
        </Row>
        <Row label="Casse">
          <div className="flex gap-1">
            {(['none', 'uppercase'] as const).map((v) => (
              <button key={v} onClick={() => setField('textTransform', v)}
                className={`flex-1 px-2 py-0.5 rounded text-[10px] font-medium border transition-colors
                  ${effectiveStyle.textTransform === v ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-white/10 text-white/40'}`}>
                {v === 'none' ? 'Aa' : 'AA'}
              </button>
            ))}
          </div>
        </Row>
      </div>

      {!isBlockSelected && (
        <button onClick={applyGlobalToAll}
          className="w-full py-1.5 rounded-lg border border-white/15 text-white/50 text-[11px] active:border-white/30 active:text-white/80 transition-colors">
          Appliquer à tous les blocs
        </button>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-white/30 font-medium">{label}</label>
      {children}
    </div>
  );
}

function ColorSwatch({ label, value, onChange, onClear }: {
  label: string; value: string; onChange: (v: string) => void; onClear?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <input type="color" value={value.startsWith('#') ? value : '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="w-7 h-7 rounded cursor-pointer border border-white/15 bg-transparent p-0.5" />
      <span className="text-[8px] text-white/25">{label}</span>
      {onClear && (
        <button onClick={onClear} className="text-[8px] text-white/20 active:text-white/50">✕</button>
      )}
    </div>
  );
}

function toHex(color: string): string {
  if (color.startsWith('#')) return color;
  return '#000000';
}
