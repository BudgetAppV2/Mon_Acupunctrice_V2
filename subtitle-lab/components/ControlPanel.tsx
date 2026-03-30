'use client';

import { useSubtitleStore } from '../lib/store';
import type { StylePreset } from '../lib/types';
import { ANIMATION_TYPES, FONT_FAMILIES } from '../lib/controlOptions';

export default function ControlPanel() {
  const {
    globalPreset,
    updateGlobalField,
    applyGlobalToAll,
    blocks,
    selectedBlockId,
    updateBlock,
    resetBlockOverrides,
  } = useSubtitleStore();

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) ?? null;
  // Effective style for selected block (overrides merged)
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
    <div className="p-4 space-y-5">
      {/* Context header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">
          {isBlockSelected ? `Bloc sélectionné` : 'Style global'}
        </p>
        {isBlockSelected && (
          <button
            onClick={() => resetBlockOverrides(selectedBlockId!)}
            className="text-[10px] text-white/40 hover:text-white/80 underline underline-offset-2"
          >
            Reset
          </button>
        )}
      </div>

      {isBlockSelected && selectedBlock && (
        <div className="bg-white/5 rounded-lg p-2 text-xs text-white/50 leading-snug line-clamp-2">
          {selectedBlock.text}
        </div>
      )}

      {/* Font family */}
      <Field label="Police">
        <select
          value={effectiveStyle.fontFamily}
          onChange={(e) => setField('fontFamily', e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white/80 focus:outline-none focus:border-white/30"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f} style={{ fontFamily: f }}>
              {f}
            </option>
          ))}
        </select>
      </Field>

      {/* Font size */}
      <Field label={`Taille — ${effectiveStyle.fontSize}px`}>
        <input
          type="range"
          min={16}
          max={60}
          value={effectiveStyle.fontSize}
          onChange={(e) => setField('fontSize', Number(e.target.value))}
          className="w-full accent-emerald-400"
        />
      </Field>

      {/* Text color */}
      <Field label="Couleur texte">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={effectiveStyle.color}
            onChange={(e) => setField('color', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-white/20 bg-transparent p-0.5"
          />
          <span className="text-xs text-white/40 font-mono">{effectiveStyle.color}</span>
        </div>
      </Field>

      {/* Background color */}
      <Field label="Fond">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={effectiveStyle.bgColor && effectiveStyle.bgColor !== 'undefined' ? effectiveStyle.bgColor.replace(/rgba?\([^)]+\)/, '#000000') : '#000000'}
            onChange={(e) => setField('bgColor', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-white/20 bg-transparent p-0.5"
          />
          <button
            onClick={() => setField('bgColor', undefined)}
            className="text-[10px] text-white/30 hover:text-white/60 underline"
          >
            Aucun
          </button>
        </div>
      </Field>

      {/* Outline */}
      <Field label={`Contour — ${effectiveStyle.outlineWidth ?? 0}px`}>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={8}
            value={effectiveStyle.outlineWidth ?? 0}
            onChange={(e) => setField('outlineWidth', Number(e.target.value))}
            className="flex-1 accent-emerald-400"
          />
          <input
            type="color"
            value={effectiveStyle.outlineColor ?? '#000000'}
            onChange={(e) => setField('outlineColor', e.target.value)}
            className="w-7 h-7 rounded cursor-pointer border border-white/20 bg-transparent p-0.5"
          />
        </div>
      </Field>

      {/* Shadow */}
      <Field label={`Ombre — ${effectiveStyle.shadowBlur ?? 0}px`}>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={40}
            value={effectiveStyle.shadowBlur ?? 0}
            onChange={(e) => setField('shadowBlur', Number(e.target.value))}
            className="flex-1 accent-emerald-400"
          />
          <input
            type="color"
            value={toHex(effectiveStyle.shadowColor ?? '#000000')}
            onChange={(e) => setField('shadowColor', e.target.value)}
            className="w-7 h-7 rounded cursor-pointer border border-white/20 bg-transparent p-0.5"
          />
        </div>
      </Field>

      {/* Animation type */}
      <Field label="Animation">
        <select
          value={effectiveStyle.animation.type}
          onChange={(e) =>
            setField('animation', {
              ...effectiveStyle.animation,
              type: e.target.value as StylePreset['animation']['type'],
            })
          }
          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white/80 focus:outline-none focus:border-white/30"
        >
          {ANIMATION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>

      {/* Letter spacing */}
      <Field label={`Espacement — ${effectiveStyle.letterSpacing ?? 0}px`}>
        <input
          type="range"
          min={-2}
          max={12}
          step={0.5}
          value={effectiveStyle.letterSpacing ?? 0}
          onChange={(e) => setField('letterSpacing', Number(e.target.value))}
          className="w-full accent-emerald-400"
        />
      </Field>

      {/* Text transform */}
      <Field label="Casse">
        <div className="flex gap-2">
          {(['none', 'uppercase'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setField('textTransform', v)}
              className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                effectiveStyle.textTransform === v
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                  : 'border-white/10 text-white/40 hover:text-white/70'
              }`}
            >
              {v === 'none' ? 'Normal' : 'MAJUSCULES'}
            </button>
          ))}
        </div>
      </Field>

      {/* Apply to all — only shown in global mode */}
      {!isBlockSelected && (
        <button
          onClick={applyGlobalToAll}
          className="w-full mt-2 py-2 rounded-lg border border-white/20 text-white/60 text-sm hover:border-white/40 hover:text-white/90 transition-colors"
        >
          Appliquer à tous les blocs
        </button>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-white/40 font-medium">{label}</label>
      {children}
    </div>
  );
}

/** Safe fallback for color input — strips rgba/rgb and returns hex */
function toHex(color: string): string {
  if (color.startsWith('#')) return color;
  return '#000000';
}
