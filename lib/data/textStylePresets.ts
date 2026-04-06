/**
 * Text style presets for the image editor.
 *
 * Source : 6 Codex presets from subtitle-lab/fabric-presets/votre-texte-paragraphe2.presets.json
 *          (pro fonts mapped to Google Fonts equivalents)
 *        + 6 La Source en Soi / wellness presets
 *
 * Coordinates are in the preset's natural space. addPreset() in TextPanel
 * dynamically scales them to fit ~60% of the 1080x1920 canvas.
 */

export interface PresetElement {
  type: 'textbox' | 'rect' | 'path' | 'circle';
  text?: string;
  path?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number | string;
  fontStyle?: string;
  fill?: string;
  textAlign?: string;
  charSpacing?: number;
  lineHeight?: number;
  top?: number;
  left?: number;
  width?: number;
  height?: number;
  rx?: number;
  ry?: number;
  angle?: number;
  originX?: string;
  originY?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeLineJoin?: string;
  underline?: boolean;
  linethrough?: boolean;
  textTransform?: string;
  opacity?: number;
  scaleX?: number;
  scaleY?: number;
  radius?: number;
  selectable?: boolean;
}

export interface TextStylePreset {
  id: string;
  name: string;
  elements: PresetElement[];
}

// ---------------------------------------------------------------------------
// 6 Codex presets — from votre-texte-paragraphe2.presets.json
// Pro fonts → Google Fonts mapping:
//   Lucy Rose → Playfair Display | Bright Sight Script → Dancing Script
//   Knockout Sumo → Bebas Neue | Placard Next Wide → Oswald
//   TAN St. Canard → Anton | Ahsing → Caveat
//   Radnika Next Condensed → Barlow Condensed | Calps Sans → Lora
//   Cooperative → Abril Fatface | Posey Textured → Pacifico
//   Libre Baskerville → Libre Baskerville (already Google Font)
// ---------------------------------------------------------------------------

const CODEX_PRESETS: TextStylePreset[] = [
  {
    id: 'passe-si-bien',
    name: 'Le Passe Vous Va Si Bien',
    elements: [
      { type: 'textbox', text: 'LE PASSE', left: 182.4, top: 47.2, width: 413.5, originX: 'left', originY: 'top', textAlign: 'center', fontFamily: 'Playfair Display', fontSize: 112, fontWeight: 400, fontStyle: 'normal', fill: '#000000' },
      { type: 'textbox', text: 'VOUS VA', left: 186.3, top: 140.8, width: 404.8, originX: 'left', originY: 'top', textAlign: 'center', fontFamily: 'Playfair Display', fontSize: 92, fontWeight: 400, fontStyle: 'normal', fill: '#000000' },
      { type: 'textbox', text: 'si bien', left: 285.3, top: 197.3, width: 218, originX: 'left', originY: 'top', textAlign: 'center', fontFamily: 'Dancing Script', fontSize: 116, fontWeight: 400, fontStyle: 'italic', fill: '#df6b28' },
    ],
  },
  {
    id: 'lab-bas-carbone',
    name: 'Le Lab Bas-Carbone',
    elements: [
      { type: 'textbox', text: 'LE LAB', left: 303.5, top: 300.4, width: 204.6, originX: 'left', originY: 'top', textAlign: 'center', fontFamily: 'Bebas Neue', fontSize: 48, fontWeight: 400, fontStyle: 'normal', charSpacing: 40, fill: '#000000' },
      { type: 'rect', left: 156.5, top: 360.8, width: 524.4, height: 139.2, originX: 'left', originY: 'top', angle: -6.867, rx: 20.2, ry: 20.2, fill: '#b3f0f0' },
      { type: 'textbox', text: 'Bas-Carbone', left: 188.2, top: 391.3, width: 465.8, originX: 'left', originY: 'top', angle: -6.867, textAlign: 'center', fontFamily: 'Oswald', fontSize: 112, fontWeight: 700, fontStyle: 'normal', fill: '#000000' },
    ],
  },
  {
    id: 'eco-logique',
    name: 'ECOlogique',
    elements: [
      { type: 'textbox', text: 'ECO', left: 245.4, top: 500, width: 319.2, originX: 'left', originY: 'top', textAlign: 'center', fontFamily: 'Anton', fontSize: 138, fontWeight: 400, fontStyle: 'normal', charSpacing: 120, fill: '#5d8662' },
      { type: 'textbox', text: 'logique', left: 228.3, top: 587.5, width: 364.2, originX: 'left', originY: 'top', textAlign: 'center', fontFamily: 'Caveat', fontSize: 118, fontWeight: 400, fontStyle: 'normal', fill: '#003c64' },
    ],
  },
  {
    id: 'cercle-vegetal',
    name: 'Le cercle vegetal',
    elements: [
      { type: 'textbox', text: 'LE CERCLE', left: 202, top: 732.7, width: 380.1, originX: 'left', originY: 'top', textAlign: 'center', fontFamily: 'Barlow Condensed', fontSize: 76, fontWeight: 700, fontStyle: 'normal', charSpacing: 260, fill: '#814a4a' },
      { type: 'textbox', text: 'vegetal', left: 213.4, top: 820.2, width: 356.5, originX: 'left', originY: 'top', textAlign: 'center', fontFamily: 'Lora', fontSize: 118, fontWeight: 400, fontStyle: 'italic', fill: '#abbb74', stroke: '#814a4a', strokeWidth: 5 },
    ],
  },
  {
    id: 'expression-libre',
    name: 'Expression Libre',
    elements: [
      { type: 'textbox', text: 'EXPRESSION', left: 164.9, top: 995.5, width: 447.6, originX: 'left', originY: 'top', textAlign: 'center', fontFamily: 'Abril Fatface', fontSize: 132, fontWeight: 400, fontStyle: 'normal', fill: '#072b50' },
      { type: 'rect', left: 403.1, top: 1102.3, width: 158.5, height: 54.8, originX: 'left', originY: 'top', angle: -10.043, fill: '#ff6105' },
      { type: 'textbox', text: 'LIBRE', left: 427.7, top: 1107.4, width: 111.8, originX: 'left', originY: 'top', angle: -10.043, textAlign: 'center', fontFamily: 'Pacifico', fontSize: 58, fontWeight: 400, fontStyle: 'italic', fill: '#072b50' },
    ],
  },
  {
    id: 'valence',
    name: 'Valence',
    elements: [
      { type: 'textbox', text: 'AUBERGE CLASSIQUE', left: 275.9, top: 1208, width: 224.2, originX: 'left', originY: 'top', textAlign: 'center', fontFamily: 'Libre Baskerville', fontSize: 16, fontWeight: 400, fontStyle: 'normal', charSpacing: 220, fill: '#000000' },
      { type: 'textbox', text: 'VALENCE', left: 211.7, top: 1253.3, width: 349.5, originX: 'left', originY: 'top', textAlign: 'center', fontFamily: 'Libre Baskerville', fontSize: 74, fontWeight: 400, fontStyle: 'normal', charSpacing: 80, fill: '#000000' },
      { type: 'rect', left: 91, top: 1317.4, width: 595.5, height: 0.75, originX: 'left', originY: 'top', fill: '#000000' },
      { type: 'textbox', text: 'PLACE DE LA COURONNE', left: 257.5, top: 1351.1, width: 263.1, originX: 'left', originY: 'top', textAlign: 'center', fontFamily: 'Libre Baskerville', fontSize: 14, fontWeight: 400, fontStyle: 'normal', charSpacing: 180, fill: '#000000' },
    ],
  },
];

// ---------------------------------------------------------------------------
// 6 La Source en Soi / wellness presets (Google Fonts native)
// ---------------------------------------------------------------------------

const WELLNESS_PRESETS: TextStylePreset[] = [
  {
    id: 'zen-wellness',
    name: 'Zen',
    elements: [
      { type: 'textbox', text: 'Bien-etre', fontFamily: 'Antic Slab', fontSize: 56, fontWeight: 400, fill: '#5C7A5F', top: 140, left: 100, width: 300 },
      { type: 'textbox', text: '& HARMONIE', fontFamily: 'Mulish', fontSize: 36, fontWeight: 700, fill: '#7EBEC5', top: 210, left: 100, width: 300, charSpacing: 200 },
    ],
  },
  {
    id: 'citation-judith',
    name: 'Citation',
    elements: [
      { type: 'textbox', text: '"La sante est un etat\nde bien-etre total"', fontFamily: 'Cormorant Garamond', fontSize: 32, fontWeight: 400, fill: '#3D5E40', fontStyle: 'italic', top: 150, left: 80, width: 360, textAlign: 'center' },
      { type: 'textbox', text: '— JUDITH D.S.', fontFamily: 'Mulish', fontSize: 14, fontWeight: 600, fill: '#7EBEC5', top: 260, left: 200, width: 200, charSpacing: 300 },
    ],
  },
  {
    id: 'evenement-atelier',
    name: 'Evenement',
    elements: [
      { type: 'textbox', text: 'VENDREDI 14 JUIN', fontFamily: 'Oswald', fontSize: 28, fontWeight: 400, fill: '#212121', top: 140, left: 80, width: 360 },
      { type: 'textbox', text: '18H00 — ATELIER', fontFamily: 'Oswald', fontSize: 22, fontWeight: 700, fill: '#212121', top: 180, left: 80, width: 360 },
      { type: 'textbox', text: "Suivi d'une collation sante", fontFamily: 'Lora', fontSize: 16, fontWeight: 400, fill: '#5C7A5F', fontStyle: 'italic', top: 215, left: 80, width: 360 },
    ],
  },
  {
    id: 'la-source-brand',
    name: 'La Source en Soi',
    elements: [
      { type: 'textbox', text: 'La Source', fontFamily: 'Antic Slab', fontSize: 52, fontWeight: 400, fill: '#5C7A5F', top: 150, left: 120, width: 300, textAlign: 'center' },
      { type: 'textbox', text: 'EN SOI', fontFamily: 'Mulish', fontSize: 38, fontWeight: 800, fill: '#7EBEC5', top: 215, left: 120, width: 300, textAlign: 'center', charSpacing: 400 },
    ],
  },
  {
    id: 'acupuncture-nature',
    name: 'Acupuncture',
    elements: [
      { type: 'textbox', text: 'Acupuncture', fontFamily: 'Lora', fontSize: 44, fontWeight: 400, fill: '#3D5E40', top: 140, left: 90, width: 340 },
      { type: 'textbox', text: '& NATURE', fontFamily: 'Nunito', fontSize: 30, fontWeight: 700, fill: '#7EBEC5', top: 195, left: 90, width: 340, charSpacing: 200 },
      { type: 'textbox', text: 'Guerir naturellement', fontFamily: 'Nunito', fontSize: 16, fontWeight: 300, fill: '#AAD1D2', top: 240, left: 90, width: 340 },
    ],
  },
  {
    id: 'promo-vert',
    name: 'Promo',
    elements: [
      { type: 'rect', width: 320, height: 70, fill: '#5C7A5F', rx: 8, ry: 8, top: 155, left: 100 },
      { type: 'textbox', text: 'NOUVEAU', fontFamily: 'Poppins', fontSize: 40, fontWeight: 800, fill: '#FFFFFF', top: 168, left: 115, width: 300, textAlign: 'center' },
      { type: 'textbox', text: 'SERVICE', fontFamily: 'Poppins', fontSize: 48, fontWeight: 800, fill: '#3D5E40', top: 235, left: 115, width: 300, textAlign: 'center' },
    ],
  },
];

// ---------------------------------------------------------------------------
// 6 ChatGPT wellness presets — from chatgpt-wellness-presets.json
// Positions are absolute (from a 2x3 grid) — scaleAndPlace normalizes them
// ---------------------------------------------------------------------------

const CHATGPT_WELLNESS: TextStylePreset[] = [
  {
    id: 'art-de-guerir',
    name: "L'Art de Guerir",
    elements: [
      // Decorative elements (behind text)
      { type: 'path', path: 'M 0 50 Q 25 0 50 50 Q 25 100 0 50', fill: '#C4A35A', opacity: 0.4, left: 120, top: 180, scaleX: 1.2, scaleY: 1.2, angle: -15, selectable: false },
      { type: 'path', path: 'M 0 0 Q 20 -10 40 0 Q 60 10 80 0', stroke: '#C4A35A', strokeWidth: 2, fill: '', opacity: 0.4, left: 140, top: 330, selectable: false },
      { type: 'circle', radius: 90, fill: '#E8E1D3', opacity: 0.3, left: 150, top: 200, selectable: false },
      // Text elements
      { type: 'textbox', text: "L'ART\nDE GUERIR", fontFamily: 'DM Serif Display', fontSize: 66, fontWeight: 400, fill: '#2B2B2B', left: 90, top: 110, width: 380, textAlign: 'center', lineHeight: 0.9 },
      { type: 'textbox', text: 'naturellement', fontFamily: 'Great Vibes', fontSize: 58, fontWeight: 400, fill: '#E08B72', left: 70, top: 285, width: 420, textAlign: 'center', angle: -2 },
    ],
  },
  {
    id: 'bien-etre-priorite',
    name: 'Bien-Etre Priorite',
    elements: [
      { type: 'path', path: 'M 10 0 L 12 8 L 20 10 L 12 12 L 10 20 L 8 12 L 0 10 L 8 8 Z', fill: '#7EBEC5', opacity: 0.25, left: 760, top: 330, selectable: false },
      { type: 'circle', radius: 110, fill: '#7EBEC5', opacity: 0.18, left: 690, top: 200, selectable: false },
      { type: 'rect', width: 200, height: 60, fill: '#E8E1D3', opacity: 0.3, left: 660, top: 260, rx: 20, ry: 20, selectable: false },
      { type: 'textbox', text: 'Votre', fontFamily: 'Playfair Display', fontSize: 58, fontWeight: 700, fontStyle: 'italic', fill: '#243E5C', left: 610, top: 110, width: 300, textAlign: 'center', charSpacing: -10 },
      { type: 'textbox', text: 'BIEN-ETRE', fontFamily: 'Anton', fontSize: 86, fontWeight: 400, fill: '#243E5C', left: 545, top: 185, width: 430, textAlign: 'center', lineHeight: 0.95 },
      { type: 'textbox', text: 'EST NOTRE PRIORITE', fontFamily: 'Montserrat', fontSize: 29, fontWeight: 500, fill: '#E08B72', left: 560, top: 310, width: 400, textAlign: 'center', charSpacing: 140 },
    ],
  },
  {
    id: 'prenez-soin',
    name: 'Prenez Soin',
    elements: [
      { type: 'circle', radius: 120, fill: '#5C7A5F', opacity: 0.15, left: 140, top: 780, selectable: false },
      { type: 'path', path: 'M 0 50 Q 25 0 50 50 Q 25 100 0 50', fill: '#5C7A5F', opacity: 0.2, left: 110, top: 860, selectable: false },
      { type: 'path', path: 'M 0 0 Q 20 -10 40 0 Q 60 10 80 0', stroke: '#5C7A5F', strokeWidth: 2, fill: '', opacity: 0.2, left: 160, top: 940, selectable: false },
      { type: 'textbox', text: 'Prenez\nsoin', fontFamily: 'Great Vibes', fontSize: 80, fontWeight: 400, fill: '#5F745B', left: 70, top: 720, width: 400, textAlign: 'center', lineHeight: 0.84, angle: -3 },
      { type: 'textbox', text: 'DE VOUS', fontFamily: 'Abril Fatface', fontSize: 56, fontWeight: 400, fill: '#E57A52', left: 95, top: 930, width: 350, textAlign: 'center', charSpacing: 20 },
    ],
  },
  {
    id: 'acupuncture-harmonie',
    name: 'Acupuncture Harmonie',
    elements: [
      { type: 'circle', radius: 140, fill: '#7EBEC5', opacity: 0.2, left: 650, top: 780, selectable: false },
      { type: 'path', path: 'M 10 0 L 12 8 L 20 10 L 12 12 L 10 20 L 8 12 L 0 10 L 8 8 Z', fill: '#C4A35A', opacity: 0.4, left: 780, top: 800, selectable: false },
      { type: 'textbox', text: 'Acupuncture', fontFamily: 'DM Serif Display', fontSize: 68, fontWeight: 400, fill: '#0D3B5B', left: 580, top: 760, width: 370, textAlign: 'center', charSpacing: -10 },
      { type: 'textbox', text: '& harmonie', fontFamily: 'Dancing Script', fontSize: 52, fontWeight: 400, fill: '#5C7A5F', left: 655, top: 870, width: 230, textAlign: 'center', angle: 2 },
    ],
  },
  {
    id: 'pouvoir-nature',
    name: 'Pouvoir de la Nature',
    elements: [
      { type: 'rect', width: 360, height: 120, fill: '#E8E1D3', opacity: 0.3, left: 80, top: 1430, rx: 40, ry: 40, selectable: false },
      { type: 'path', path: 'M 0 50 Q 25 0 50 50 Q 25 100 0 50', fill: '#5C7A5F', opacity: 0.2, left: 90, top: 1500, selectable: false },
      { type: 'path', path: 'M 10 0 L 12 8 L 20 10 L 12 12 L 10 20 L 8 12 L 0 10 L 8 8 Z', fill: '#C4A35A', opacity: 0.4, left: 110, top: 1320, selectable: false },
      { type: 'textbox', text: 'LE POUVOIR', fontFamily: 'Oswald', fontSize: 50, fontWeight: 700, fill: '#5F745B', left: 95, top: 1310, width: 350, textAlign: 'center', charSpacing: 40 },
      { type: 'textbox', text: 'DE LA', fontFamily: 'Oswald', fontSize: 42, fontWeight: 600, fill: '#5F745B', left: 170, top: 1395, width: 200, textAlign: 'center', charSpacing: 30 },
      { type: 'textbox', text: 'NATURE', fontFamily: 'Anton', fontSize: 74, fontWeight: 400, fill: '#E57A52', left: 100, top: 1472, width: 310, textAlign: 'center' },
    ],
  },
  {
    id: 'sante-naturel',
    name: 'Sante au Naturel',
    elements: [
      { type: 'path', path: 'M 0 0 Q 20 -10 40 0 Q 60 10 80 0', stroke: '#C4A35A', strokeWidth: 2, fill: '', opacity: 0.4, left: 650, top: 1470, selectable: false },
      { type: 'circle', radius: 110, fill: '#E8E1D3', opacity: 0.3, left: 660, top: 1350, selectable: false },
      { type: 'path', path: 'M 10 0 L 12 8 L 20 10 L 12 12 L 10 20 L 8 12 L 0 10 L 8 8 Z', fill: '#C4A35A', opacity: 0.4, left: 780, top: 1340, selectable: false },
      { type: 'textbox', text: 'SANTE', fontFamily: 'Raleway', fontSize: 58, fontWeight: 300, fill: '#5F745B', left: 610, top: 1295, width: 300, textAlign: 'center', charSpacing: 240 },
      { type: 'textbox', text: '& BIEN-ETRE', fontFamily: 'Cormorant Garamond', fontSize: 60, fontWeight: 500, fill: '#5F745B', left: 560, top: 1380, width: 400, textAlign: 'center', charSpacing: 40 },
      { type: 'textbox', text: 'au naturel', fontFamily: 'Dancing Script', fontSize: 56, fontWeight: 400, fill: '#E08B72', left: 615, top: 1495, width: 290, textAlign: 'center', angle: -2 },
    ],
  },
];

export const TEXT_STYLE_PRESETS: TextStylePreset[] = [...CODEX_PRESETS, ...WELLNESS_PRESETS, ...CHATGPT_WELLNESS];

/** Collect unique font families from a preset */
export function presetFonts(preset: TextStylePreset): string[] {
  const set = new Set<string>();
  for (const el of preset.elements) {
    if (el.type === 'textbox' && el.fontFamily) set.add(el.fontFamily);
  }
  return [...set];
}
