'use client';

import { useState, useEffect } from 'react';
import type { Canvas, Textbox as TTextbox } from 'fabric';
import { ActiveSelection, Group, Textbox, Rect, Circle, Path, loadSVGFromString, type FabricObject } from 'fabric';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { PALETTE } from '@/lib/data/imageEditorTemplates';
import {
  GOOGLE_FONTS, FONT_CATEGORIES, WEIGHT_LABELS,
  buildPreviewUrl, loadFont, type FontCategory,
} from '@/lib/image-editor/fontList';
import { TEXT_STYLE_PRESETS, presetFonts, type TextStylePreset, type PresetElement } from '@/lib/data/textStylePresets';
import { CANVA_TEXT_PRESETS, type SvgPreset } from '@/lib/data/canvaTextPresets';

interface Props { canvas: Canvas | null; extractedPalette: string[] }

const CW = 1080;
const CH = 1920;

function scaleAndPlace(
  canvas: Canvas,
  elements: PresetElement[],
  srcW?: number, srcH?: number,
) {
  console.log('[CanvaPreset] scaleAndPlace:start', {
    count: elements.length,
    srcW,
    srcH,
  });

  if (elements.length === 0) {
    console.log('[CanvaPreset] scaleAndPlace:empty');
    return 0;
  }

  let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
  for (const el of elements) {
    const l = el.left ?? 0, t = el.top ?? 0;
    const r = el.radius ?? 0;
    const w = el.width ?? (r > 0 ? r * 2 : 200);
    const h = el.height ?? (r > 0 ? r * 2 : (el.fontSize ?? 32) * 1.4);
    minX = Math.min(minX, l); minY = Math.min(minY, t);
    maxX = Math.max(maxX, l + w); maxY = Math.max(maxY, t + h);
  }
  const referenceX = srcW != null ? 0 : minX;
  const referenceY = srcH != null ? 0 : minY;
  const pw = Math.max(srcW ?? (maxX - minX), 1);
  const ph = Math.max(srcH ?? (maxY - minY), 1);
  const scale = Math.min((CW * 0.65) / pw, (CH * 0.25) / ph, 3);
  const offsetX = (CW - pw * scale) / 2;
  const offsetY = (CH - ph * scale) / 2;

  const fabricObjs: FabricObject[] = [];
  canvas.discardActiveObject();

  for (const el of elements) {
    const opts: Record<string, unknown> = {
      left: offsetX + ((el.left ?? 0) - referenceX) * scale,
      top: offsetY + ((el.top ?? 0) - referenceY) * scale,
      selectable: true, evented: true,
    };
    // Scale-dependent props
    if (el.width) opts.width = el.width * scale;
    if (el.height) opts.height = el.height * scale;
    if (el.fontSize) opts.fontSize = el.fontSize * scale;
    if (el.rx) opts.rx = el.rx * scale;
    if (el.ry) opts.ry = el.ry * scale;
    if (el.strokeWidth) opts.strokeWidth = el.strokeWidth * scale;
    if (el.radius) opts.radius = el.radius * scale;
    // Pass-through props
    if (el.fontFamily) opts.fontFamily = el.fontFamily;
    if (el.fontWeight != null) opts.fontWeight = el.fontWeight;
    if (el.fontStyle && el.fontStyle !== 'normal') opts.fontStyle = el.fontStyle;
    if (el.fill != null) opts.fill = el.fill;
    if (el.textAlign && el.textAlign !== 'left') opts.textAlign = el.textAlign;
    if (el.charSpacing) opts.charSpacing = el.charSpacing;
    if (el.lineHeight) opts.lineHeight = el.lineHeight;
    if (el.angle) opts.angle = el.angle;
    if (el.originX) opts.originX = el.originX;
    if (el.originY) opts.originY = el.originY;
    if (el.stroke) opts.stroke = el.stroke;
    if (el.opacity != null) opts.opacity = el.opacity;
    if (el.scaleX) opts.scaleX = el.scaleX;
    if (el.scaleY) opts.scaleY = el.scaleY;
    if (el.underline) opts.underline = true;
    if (el.linethrough) opts.linethrough = true;

    let txt = el.text ?? '';
    if (el.textTransform === 'uppercase') txt = txt.toUpperCase();

    if (el.type === 'textbox') {
      fabricObjs.push(new Textbox(txt, { ...opts, editable: true }));
    } else if (el.type === 'rect') {
      fabricObjs.push(new Rect(opts));
    } else if (el.type === 'circle') {
      fabricObjs.push(new Circle(opts));
    } else if (el.type === 'path' && el.path) {
      fabricObjs.push(new Path(el.path, opts));
    }
  }

  if (fabricObjs.length === 0) {
    console.log('[CanvaPreset] scaleAndPlace:no-fabric-objects');
    return 0;
  }

  fabricObjs.forEach((obj) => {
    canvas.add(obj);
    obj.setCoords();
  });

  const selection = new ActiveSelection(fabricObjs, { canvas });
  canvas.setActiveObject(selection);
  canvas.requestRenderAll();

  console.log('[CanvaPreset] scaleAndPlace:added', {
    added: fabricObjs.length,
    scale,
    bounds: { minX, minY, maxX, maxY },
  });

  return fabricObjs.length;
}

function scaleAndPlaceGroup(
  canvas: Canvas,
  object: FabricObject,
  srcW?: number,
  srcH?: number,
) {
  const pw = Math.max(srcW ?? object.width ?? 1, 1);
  const ph = Math.max(srcH ?? object.height ?? 1, 1);
  const scale = Math.min((CW * 0.65) / pw, (CH * 0.25) / ph, 3);
  const offsetX = (CW - pw * scale) / 2;
  const offsetY = (CH - ph * scale) / 2;

  canvas.discardActiveObject();
  object.set({
    left: offsetX,
    top: offsetY,
    originX: 'left',
    originY: 'top',
    scaleX: scale,
    scaleY: scale,
    selectable: true,
    evented: true,
  });
  canvas.add(object);
  object.setCoords();
  canvas.setActiveObject(object);
  canvas.requestRenderAll();

  console.log('[CanvaPreset] scaleAndPlaceGroup:added', {
    scale,
    sourceWidth: pw,
    sourceHeight: ph,
  });

  return 1;
}

export default function TextPanel({ canvas, extractedPalette }: Props) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<FontCategory | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [section, setSection] = useState<'canva' | 'styles' | 'fonts'>('canva');

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

  const addSvgPreset = async (p: SvgPreset) => {
    if (!canvas) return;
    console.log('[CanvaPreset] addSvgPreset:start', {
      id: p.id,
      name: p.name,
      pageNumber: p.pageNumber,
      fonts: p.fonts,
      renderMode: p.renderMode,
    });

    if (p.renderMode === 'vector') {
      const response = await fetch(p.sourceSvgUrl);
      const svgMarkup = await response.text();
      const parsed = await loadSVGFromString(svgMarkup);
      const vectorObjects = parsed.objects.filter((obj): obj is FabricObject => {
        if (!obj) return false;
        const width = obj.width ?? 0;
        const height = obj.height ?? 0;
        const fill = typeof obj.fill === 'string' ? obj.fill.toLowerCase() : '';
        const isBackground = obj.type === 'rect'
          && (fill === '#ffffff' || fill === 'white' || fill === 'rgb(255,255,255)')
          && width >= p.sourceWidth * 0.9
          && height >= p.sourceHeight * 0.9;
        return !isBackground;
      });

      const anchor = new Rect({
        left: 0,
        top: 0,
        width: p.sourceWidth,
        height: p.sourceHeight,
        fill: 'rgba(0,0,0,0)',
        strokeWidth: 0,
        selectable: false,
        evented: false,
      });

      const group = new Group([anchor, ...vectorObjects], {
        left: 0,
        top: 0,
        originX: 'left',
        originY: 'top',
        selectable: true,
        evented: true,
      });

      const added = scaleAndPlaceGroup(canvas, group, p.sourceWidth, p.sourceHeight);
      console.log('[CanvaPreset] addSvgPreset:done', { added });
      return;
    }

    const fontVariants = Array.from(new Map(
      p.fabricData.map((el) => [
        `${el.fontFamily}:${el.fontWeight}:${el.fontStyle}`,
        { family: el.fontFamily, weight: Number(el.fontWeight) || 400, style: el.fontStyle ?? 'normal' as 'normal' | 'italic' },
      ]),
    ).values());

    await Promise.all(fontVariants.map(({ family, weight, style }) => loadFont(family, weight, style)));
    await Promise.all(fontVariants.map(async ({ family, weight, style }) => {
      try {
        await document.fonts.load(`${style} ${weight} 16px "${family}"`);
      } catch {
        /* ignore font load failures */
      }
    }));

    console.log('[CanvaPreset] addSvgPreset:parsed', {
      elements: p.fabricData.length,
      fontVariants: fontVariants.length,
    });

    const added = scaleAndPlace(canvas, p.fabricData, p.sourceWidth, p.sourceHeight);
    console.log('[CanvaPreset] addSvgPreset:done', { added });
  };

  const addPreset = async (p: TextStylePreset) => {
    if (!canvas) return;
    await Promise.all(presetFonts(p).map((f) => loadFont(f)));
    scaleAndPlace(canvas, p.elements);
  };

  const addText = (label: string, ff: string, fs: number, fw: string) => {
    if (!canvas) return;
    canvas.add(new Textbox(label, {
      left: 540, top: 960, originX: 'center', originY: 'center',
      fontFamily: ff, fontSize: fs, fontWeight: fw,
      fill: PALETTE.charcoal, textAlign: 'center', width: 800, editable: true, selectable: true,
    }));
    canvas.renderAll();
  };

  const applyFont = async (name: string, weight: number = 400) => {
    await loadFont(name, weight);
    set('fontFamily', name); set('fontWeight', String(weight));
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
      {/* Quick add */}
      <div className="flex gap-1 mb-3">
        {[{ l: 'Titre', ff: 'Antic Slab', fs: 80, fw: '400' }, { l: 'Sous-titre', ff: 'Mulish', fs: 48, fw: '700' }, { l: 'Corps', ff: 'Mulish', fs: 32, fw: '400' }].map((s) => (
          <button key={s.l} onClick={() => addText(s.l, s.ff, s.fs, s.fw)}
            className="flex-1 px-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] text-white/60">{s.l}</button>
        ))}
      </div>

      {txt && <TextToolbar txt={txt} set={set} toggleCase={toggleCase} />}

      {extractedPalette.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {extractedPalette.map((c, i) => (
            <button key={i} onClick={() => set('fill', c)}
              className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
          ))}
        </div>
      )}

      {/* Section toggle */}
      <div className="flex gap-1 mb-3">
        {([['canva', 'Canva'], ['styles', 'Styles'], ['fonts', 'Polices']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setSection(id)}
            className={`flex-1 py-1 rounded-lg text-[10px] ${section === id ? 'bg-teal-500 text-white' : 'bg-white/5 text-white/50'}`}>{label}</button>
        ))}
      </div>

      {section === 'canva' ? (
        <div className="grid grid-cols-2 gap-2">
          {CANVA_TEXT_PRESETS.map((p) => (
            <button key={p.id} onClick={() => addSvgPreset(p)}
              className="rounded-lg border border-gray-200 bg-white p-2 text-left transition-colors hover:border-teal-400">
              <img
                src={p.thumbnail}
                alt={p.name}
                loading="lazy"
                className="h-[140px] w-full overflow-hidden rounded-lg bg-white object-contain shadow-sm"
              />
              <div className="mt-2 truncate text-[9px] font-medium text-gray-700">{p.name}</div>
              <div className="truncate text-[8px] text-gray-400">{p.fonts.join(' / ')}</div>
            </button>
          ))}
        </div>
      ) : section === 'styles' ? (
        <div className="grid grid-cols-2 gap-2">
          {TEXT_STYLE_PRESETS.map((p) => (
            <button key={p.id} onClick={() => addPreset(p)}
              className="rounded-lg border border-gray-200 hover:border-teal-400 transition-colors overflow-hidden bg-white">
              <PresetCard preset={p} />
              <div className="text-[7px] text-gray-400 px-2 pb-1">{p.name}</div>
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="relative mb-2">
            <MagnifyingGlassIcon className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..."
              className="w-full pl-7 pr-2 py-1 text-[10px] bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-teal-400" />
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {FONT_CATEGORIES.map((c) => (
              <button key={c.id} onClick={() => setCatFilter(catFilter === c.id ? null : c.id)}
                className={`px-1.5 py-0.5 rounded-full text-[9px] ${catFilter === c.id ? 'bg-teal-500 text-white' : 'bg-white/5 text-white/40 hover:text-white/70'}`}>{c.label}</button>
            ))}
          </div>
          <div className="space-y-0.5 max-h-[300px] overflow-y-auto">
            {filtered.map((f) => (
              <div key={f.name}>
                <button onClick={() => { applyFont(f.name); setExpanded(expanded === f.name ? null : f.name); }}
                  className={`w-full text-left px-2 py-1.5 rounded text-[11px] transition-colors ${txt?.fontFamily === f.name ? 'bg-teal-500/20 text-teal-300' : 'text-white/70 hover:bg-white/5'}`}
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
        </>
      )}
    </div>
  );
}

function TextToolbar({ txt, set, toggleCase }: { txt: TTextbox; set: (k: string, v: unknown) => void; toggleCase: () => void }) {
  return (
    <div className="border border-white/10 rounded-lg p-2 mb-3 space-y-2">
      <div className="flex items-center gap-1">
        <span className="text-[9px] text-white/40 w-8">Taille</span>
        <button onClick={() => set('fontSize', Math.max(8, (txt.fontSize ?? 32) - 2))} className="px-1.5 py-0.5 text-[10px] bg-white/5 rounded text-white/60 hover:bg-white/10">-</button>
        <span className="text-[11px] text-white/80 w-8 text-center">{txt.fontSize}</span>
        <button onClick={() => set('fontSize', (txt.fontSize ?? 32) + 2)} className="px-1.5 py-0.5 text-[10px] bg-white/5 rounded text-white/60 hover:bg-white/10">+</button>
      </div>
      <div className="flex gap-1">
        <Fb label="B" on={txt.fontWeight === 'bold' || Number(txt.fontWeight) >= 700} fn={() => set('fontWeight', (txt.fontWeight === 'bold' || Number(txt.fontWeight) >= 700) ? 'normal' : 'bold')} fw={700} />
        <Fb label="I" on={txt.fontStyle === 'italic'} fn={() => set('fontStyle', txt.fontStyle === 'italic' ? 'normal' : 'italic')} fs="italic" />
        <Fb label="U" on={!!txt.underline} fn={() => set('underline', !txt.underline)} td="underline" />
        <Fb label="S" on={!!txt.linethrough} fn={() => set('linethrough', !txt.linethrough)} td="line-through" />
        <button onClick={toggleCase} className="px-1.5 py-1 text-[9px] rounded bg-white/5 text-white/50 hover:bg-white/10">Aa</button>
      </div>
      <div className="flex gap-1">
        {(['left', 'center', 'right'] as const).map((a) => (
          <button key={a} onClick={() => set('textAlign', a)}
            className={`flex-1 py-1 rounded text-[9px] ${txt.textAlign === a ? 'bg-teal-500/30 text-teal-300' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
            {a === 'left' ? 'Gauche' : a === 'center' ? 'Centre' : 'Droite'}
          </button>
        ))}
      </div>
      <Sl label="Opacite" min={0} max={100} val={Math.round((txt.opacity ?? 1) * 100)} fn={(v) => set('opacity', v / 100)} suf="%" />
      <Sl label="Lettres" min={-200} max={800} val={txt.charSpacing ?? 0} fn={(v) => set('charSpacing', v)} />
      <Sl label="Interligne" min={60} max={300} val={Math.round((txt.lineHeight ?? 1.16) * 100)} fn={(v) => set('lineHeight', v / 100)} />
    </div>
  );
}

function Fb({ label, on, fn, fw, fs, td }: { label: string; on: boolean; fn: () => void; fw?: number; fs?: string; td?: string }) {
  return (
    <button onClick={fn} className={`w-7 h-7 rounded text-[11px] ${on ? 'bg-teal-500/30 text-teal-300' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
      style={{ fontWeight: fw, fontStyle: fs, textDecoration: td }}>{label}</button>
  );
}

function Sl({ label, min, max, val, fn, suf }: { label: string; min: number; max: number; val: number; fn: (v: number) => void; suf?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-white/40 w-12">{label}</span>
      <input type="range" min={min} max={max} value={val} onChange={(e) => fn(Number(e.target.value))} className="flex-1 h-1 accent-teal-500" />
      {suf && <span className="text-[9px] text-white/50 w-8 text-right">{val}{suf}</span>}
    </div>
  );
}

/** Preset card with decorative elements rendered as SVG + text as HTML */
function PresetCard({ preset }: { preset: TextStylePreset }) {
  // Bounding box for scaling the preview
  let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
  for (const el of preset.elements) {
    const l = el.left ?? 0, t = el.top ?? 0;
    const w = el.width ?? (el.radius ? el.radius * 2 : 50);
    const h = el.height ?? (el.radius ? el.radius * 2 : (el.fontSize ?? 16) * 1.2);
    minX = Math.min(minX, l); minY = Math.min(minY, t);
    maxX = Math.max(maxX, l + w); maxY = Math.max(maxY, t + h);
  }
  const pw = maxX - minX || 1, ph = maxY - minY || 1;
  const s = Math.min(120 / pw, 90 / ph, 1);

  const decor = preset.elements.filter((e) => e.type !== 'textbox');
  const texts = preset.elements.filter((e) => e.type === 'textbox');

  return (
    <div className="relative p-1" style={{ height: 100, overflow: 'hidden' }}>
      {/* Decorative SVG layer */}
      {decor.length > 0 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`${minX} ${minY} ${pw} ${ph}`} preserveAspectRatio="xMidYMid meet">
          {decor.map((el, i) => {
            if (el.type === 'circle') return <circle key={i} cx={(el.left ?? 0) + (el.radius ?? 0)} cy={(el.top ?? 0) + (el.radius ?? 0)} r={el.radius ?? 0} fill={el.fill || 'none'} opacity={el.opacity ?? 1} />;
            if (el.type === 'path' && el.path) return <path key={i} d={el.path} fill={el.fill || 'none'} stroke={el.stroke || 'none'} strokeWidth={el.strokeWidth || 0} opacity={el.opacity ?? 1} transform={`translate(${el.left ?? 0},${el.top ?? 0})${el.angle ? ` rotate(${el.angle})` : ''}`} />;
            if (el.type === 'rect') return <rect key={i} x={el.left ?? 0} y={el.top ?? 0} width={el.width ?? 0} height={el.height ?? 0} rx={el.rx ?? 0} fill={el.fill || 'none'} opacity={el.opacity ?? 1} />;
            return null;
          })}
        </svg>
      )}
      {/* Text layer */}
      <div className="relative z-10 flex flex-col justify-center h-full">
        {texts.slice(0, 3).map((el, i) => (
          <div key={i} className="truncate leading-tight" style={{
            fontFamily: `"${el.fontFamily}", sans-serif`,
            fontSize: Math.max(Math.min((el.fontSize ?? 16) * s, 16), 7),
            fontWeight: Number(el.fontWeight) || 400,
            fontStyle: el.fontStyle ?? 'normal',
            color: el.fill ?? '#222',
            textAlign: (el.textAlign ?? 'left') as React.CSSProperties['textAlign'],
            transform: el.angle ? `rotate(${el.angle}deg)` : undefined,
          }}>
            {(el.text ?? '').split('\n')[0]}
          </div>
        ))}
      </div>
    </div>
  );
}
