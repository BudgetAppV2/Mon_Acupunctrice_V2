/**
 * 40 Canva text style presets as SVG strings.
 * Thumbnails render via dangerouslySetInnerHTML (fonts loaded via @import in SVG defs).
 * On click, SVG text elements are parsed into Fabric.js Textbox objects.
 */

import bundle from './canva-svg-bundle.json';

export interface SvgPreset {
  id: string;
  name: string;
  svg: string;
}

export const SVG_PRESETS: SvgPreset[] = Object.entries(bundle).map(([filename, svg], i) => ({
  id: `svg-${i}`,
  name: filename.replace(/^preset-\d+-/, '').replace('.svg', '').replace(/-/g, ' '),
  svg: svg as string,
}));

// --- SVG to Fabric.js parsing ---

export interface ParsedTextElement {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: string;
  fill: string;
  left: number;
  top: number;
  textAlign: string;
  charSpacing: number;
  lineHeight: number;
  width: number;
  angle: number;
}

function anchorToAlign(anchor: string): string {
  if (anchor === 'middle') return 'center';
  if (anchor === 'end') return 'right';
  return 'left';
}

function parseLS(ls: string | null): number {
  if (!ls) return 0;
  const m = ls.match(/([-\d.]+)em/);
  return m ? Math.round(parseFloat(m[1]) * 1000) : 0;
}

/** Extract font names from data-fonts attribute */
export function extractFontsFromSvg(svg: string): string[] {
  const m = svg.match(/data-fonts="([^"]+)"/);
  if (!m) return [];
  return m[1].split(',').map((f) => f.trim());
}

/** Parse SVG text elements into Fabric-ready data + viewBox dims */
export function parseSvgTexts(svg: string): { elements: ParsedTextElement[]; vw: number; vh: number } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');
  const svgEl = doc.querySelector('svg');
  const vb = svgEl?.getAttribute('viewBox')?.split(/\s+/).map(Number) || [0, 0, 758, 389];

  const elements: ParsedTextElement[] = [];

  doc.querySelectorAll('text').forEach((textEl) => {
    const tspans = textEl.querySelectorAll('tspan');
    const lines = tspans.length > 0
      ? Array.from(tspans).map((ts) => ts.textContent ?? '')
      : [textEl.textContent ?? ''];

    const fontSize = parseFloat(textEl.getAttribute('font-size') || '24');

    let lineHeight = 1.16;
    if (tspans.length >= 2) {
      const dy = parseFloat(tspans[1].getAttribute('dy') || '0');
      if (dy > 0) lineHeight = Math.round((dy / fontSize) * 100) / 100;
    }

    const textX = parseFloat(textEl.getAttribute('x') || '0');
    const anchor = textEl.getAttribute('text-anchor') || 'start';
    const estimatedWidth = anchor === 'middle' ? vb[2] * 0.8 : vb[2] - textX;

    elements.push({
      text: lines.join('\n'),
      fontFamily: (textEl.getAttribute('font-family') || 'sans-serif').replace(/'/g, '').split(',')[0].trim(),
      fontSize,
      fontWeight: parseInt(textEl.getAttribute('font-weight') || '400', 10),
      fontStyle: textEl.getAttribute('font-style') || 'normal',
      fill: textEl.getAttribute('fill') || '#222222',
      left: textX,
      top: parseFloat(textEl.getAttribute('y') || '0') - fontSize * 0.85,
      textAlign: anchorToAlign(anchor),
      charSpacing: parseLS(textEl.getAttribute('letter-spacing')),
      lineHeight,
      width: Math.max(estimatedWidth, 100),
      angle: parseFloat(textEl.getAttribute('transform')?.match(/rotate\(([-\d.]+)/)?.[1] || '0'),
    });
  });

  return { elements, vw: vb[2], vh: vb[3] };
}
