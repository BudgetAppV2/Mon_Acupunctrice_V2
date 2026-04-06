'use client';

import { useState, useEffect } from 'react';
import type { Canvas, Textbox as TTextbox } from 'fabric';
import { Textbox } from 'fabric';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { PALETTE } from '@/lib/data/imageEditorTemplates';
import {
  GOOGLE_FONTS, FONT_CATEGORIES, WEIGHT_LABELS,
  buildPreviewUrl, loadFont,
  type FontCategory,
} from '@/lib/image-editor/fontList';

interface Props { canvas: Canvas | null; extractedPalette: string[] }

const ADD_STYLES = [
  { label: 'Titre', fontFamily: 'Antic Slab', fontSize: 80, fontWeight: '400' },
  { label: 'Sous-titre', fontFamily: 'Mulish', fontSize: 48, fontWeight: '700' },
  { label: 'Corps', fontFamily: 'Mulish', fontSize: 32, fontWeight: '400' },
];

export default function TextPanel({ canvas, extractedPalette }: Props) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<FontCategory | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Load font preview subset once
  useEffect(() => {
    if (document.getElementById('gf-previews')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.id = 'gf-previews';
    link.href = buildPreviewUrl();
    document.head.appendChild(link);
  }, []);

  const active = canvas?.getActiveObject();
  const isText = active?.type === 'textbox' || active?.type === 'i-text';
  const txt = isText ? (active as TTextbox) : null;

  const set = (k: string, v: unknown) => { if (txt && canvas) { txt.set(k as keyof TTextbox, v); canvas.renderAll(); } };

  const addText = (style: (typeof ADD_STYLES)[number]) => {
    if (!canvas) return;
    const t = new Textbox(style.label, {
      left: 540, top: 960, originX: 'center', originY: 'center',
      fontFamily: style.fontFamily, fontSize: style.fontSize, fontWeight: style.fontWeight,
      fill: PALETTE.charcoal, textAlign: 'center', width: 800, editable: true, selectable: true,
    });
    canvas.add(t); canvas.setActiveObject(t); canvas.renderAll();
  };

  const applyFont = async (name: string, weight: number = 400) => {
    await loadFont(name, weight);
    set('fontFamily', name);
    set('fontWeight', String(weight));
  };

  const toggleCase = () => {
    if (!txt) return;
    const t = txt.text ?? '';
    if (t === t.toUpperCase()) set('text', t.toLowerCase());
    else if (t === t.toLowerCase()) set('text', t.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '));
    else set('text', t.toUpperCase());
  };

  const filtered = GOOGLE_FONTS.filter((f) => {
    if (catFilter && f.category !== catFilter) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      {/* Add text buttons */}
      <h3 className="text-xs font-semibold text-white/60 uppercase mb-2">Ajouter du texte</h3>
      <div className="space-y-1.5 mb-4">
        {ADD_STYLES.map((s) => (
          <button key={s.label} onClick={() => addText(s)}
            className="w-full text-left px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <span className="text-white/80" style={{ fontFamily: s.fontFamily, fontSize: Math.min(s.fontSize / 4, 16) }}>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Text toolbar — visible when text selected */}
      {txt && (
        <div className="border border-white/10 rounded-lg p-2 mb-4 space-y-2">
          {/* Size */}
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-white/40 w-8">Taille</span>
            <button onClick={() => set('fontSize', Math.max(8, (txt.fontSize ?? 32) - 2))} className="px-1.5 py-0.5 text-[10px] bg-white/5 rounded text-white/60 hover:bg-white/10">-</button>
            <span className="text-[11px] text-white/80 w-8 text-center">{txt.fontSize}</span>
            <button onClick={() => set('fontSize', (txt.fontSize ?? 32) + 2)} className="px-1.5 py-0.5 text-[10px] bg-white/5 rounded text-white/60 hover:bg-white/10">+</button>
          </div>
          {/* B I U S + Case */}
          <div className="flex gap-1">
            <TBtn label="B" active={txt.fontWeight === 'bold' || Number(txt.fontWeight) >= 700} onClick={() => set('fontWeight', (txt.fontWeight === 'bold' || Number(txt.fontWeight) >= 700) ? 'normal' : 'bold')} bold />
            <TBtn label="I" active={txt.fontStyle === 'italic'} onClick={() => set('fontStyle', txt.fontStyle === 'italic' ? 'normal' : 'italic')} italic />
            <TBtn label="U" active={!!txt.underline} onClick={() => set('underline', !txt.underline)} underline />
            <TBtn label="S" active={!!txt.linethrough} onClick={() => set('linethrough', !txt.linethrough)} strike />
            <button onClick={toggleCase} className="px-1.5 py-1 text-[9px] rounded bg-white/5 text-white/50 hover:bg-white/10" title="Casse">Aa</button>
          </div>
          {/* Alignment */}
          <div className="flex gap-1">
            {(['left', 'center', 'right'] as const).map((a) => (
              <button key={a} onClick={() => set('textAlign', a)}
                className={`flex-1 py-1 rounded text-[9px] ${txt.textAlign === a ? 'bg-teal-500/30 text-teal-300' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                {a === 'left' ? 'Gauche' : a === 'center' ? 'Centre' : 'Droite'}
              </button>
            ))}
          </div>
          {/* Opacity */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-white/40 w-12">Opacite</span>
            <input type="range" min={0} max={100} value={Math.round((txt.opacity ?? 1) * 100)}
              onChange={(e) => set('opacity', Number(e.target.value) / 100)}
              className="flex-1 h-1 accent-teal-500" />
            <span className="text-[9px] text-white/50 w-8 text-right">{Math.round((txt.opacity ?? 1) * 100)}%</span>
          </div>
          {/* Spacing */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-white/40 w-12">Lettres</span>
            <input type="range" min={-200} max={800} value={txt.charSpacing ?? 0}
              onChange={(e) => set('charSpacing', Number(e.target.value))}
              className="flex-1 h-1 accent-teal-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-white/40 w-12">Interligne</span>
            <input type="range" min={60} max={300} value={Math.round((txt.lineHeight ?? 1.16) * 100)}
              onChange={(e) => set('lineHeight', Number(e.target.value) / 100)}
              className="flex-1 h-1 accent-teal-500" />
          </div>
        </div>
      )}

      {/* Color palettes */}
      {extractedPalette.length > 0 && (
        <>
          <h3 className="text-[10px] text-white/40 mb-1">Palette image</h3>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {extractedPalette.map((c, i) => (
              <button key={i} onClick={() => set('fill', c)}
                className="w-6 h-6 rounded-full border border-white/20 hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
            ))}
          </div>
        </>
      )}

      {/* Font browser */}
      <h3 className="text-xs font-semibold text-white/60 uppercase mb-2">Polices</h3>
      <div className="relative mb-2">
        <MagnifyingGlassIcon className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-white/30" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="w-full pl-7 pr-2 py-1 text-[10px] bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-teal-400" />
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {FONT_CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCatFilter(catFilter === c.id ? null : c.id)}
            className={`px-1.5 py-0.5 rounded-full text-[9px] ${catFilter === c.id ? 'bg-teal-500 text-white' : 'bg-white/5 text-white/40 hover:text-white/70'}`}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="space-y-0.5 max-h-[300px] overflow-y-auto">
        {filtered.map((f) => (
          <div key={f.name}>
            <button onClick={() => { applyFont(f.name); setExpanded(expanded === f.name ? null : f.name); }}
              className={`w-full text-left px-2 py-1.5 rounded text-[11px] transition-colors ${
                txt?.fontFamily === f.name ? 'bg-teal-500/20 text-teal-300' : 'text-white/70 hover:bg-white/5'
              }`}
              style={{ fontFamily: `"${f.name}", sans-serif` }}>
              <span className="block truncate">{f.name}</span>
              <span className="text-[9px] text-white/30">{f.category}</span>
            </button>
            {expanded === f.name && f.weights.length > 1 && (
              <div className="pl-3 py-1 space-y-0.5">
                {f.weights.map((w) => (
                  <button key={w} onClick={() => applyFont(f.name, w)}
                    className="block w-full text-left px-2 py-0.5 rounded text-[10px] text-white/50 hover:bg-white/5 hover:text-white/80"
                    style={{ fontFamily: `"${f.name}", sans-serif`, fontWeight: w }}>
                    {WEIGHT_LABELS[w] ?? w} ({w})
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TBtn({ label, active, onClick, bold, italic, underline, strike }: {
  label: string; active: boolean; onClick: () => void;
  bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean;
}) {
  return (
    <button onClick={onClick}
      className={`w-7 h-7 rounded text-[11px] transition-colors ${active ? 'bg-teal-500/30 text-teal-300' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
      style={{ fontWeight: bold ? 700 : 400, fontStyle: italic ? 'italic' : 'normal', textDecoration: underline ? 'underline' : strike ? 'line-through' : 'none' }}>
      {label}
    </button>
  );
}
