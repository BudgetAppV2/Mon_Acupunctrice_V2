/**
 * Template "La Source en Soi" for the image editor.
 * Reproduces the Canva story design with Fabric.js objects.
 * Each element is individually editable and draggable.
 */

export const PALETTE = {
  lightMint: '#D4EDEC',
  turquoise: '#7EBEC5',
  teal: '#5BA5AD',
  darkTeal: '#3D7A8A',
  navy: '#2B4C6F',
  cyan: '#A8E0E4',
  charcoal: '#212121',
  darkGreen: '#1A3A2A',
  cream: '#F4F4F4',
  sage: '#5C7A5F',
  white: '#FFFFFF',
};

export const LOGO_URL = '/images/logo-la-source-en-soi.png';

const W = 1080;
const H = 1920;

/**
 * Build the template as an array of Fabric.js object configs.
 * Called in ImageEditorCanvas after canvas init.
 */
export function getTemplateObjects(): Record<string, unknown>[] {
  return [
    // --- Background layers (organic shapes approximated as rects + ellipses) ---

    // Full background — light mint
    { type: 'rect', left: 0, top: 0, width: W, height: H, fill: PALETTE.lightMint, selectable: false, evented: false },

    // Large turquoise wave — top-right organic blob (simplified as ellipse)
    { type: 'ellipse', left: 400, top: -200, rx: 600, ry: 500, fill: PALETTE.turquoise, selectable: false, evented: false, opacity: 0.8 },

    // Teal band — middle area
    { type: 'rect', left: 0, top: 380, width: W, height: 500, fill: PALETTE.teal, selectable: false, evented: false, opacity: 0.7 },

    // Dark teal / navy section — bottom
    { type: 'rect', left: 0, top: 1400, width: W, height: 520, fill: PALETTE.darkTeal, selectable: false, evented: false, opacity: 0.8 },

    // Navy bottom corner blob
    { type: 'ellipse', left: 500, top: 1550, rx: 500, ry: 400, fill: PALETTE.navy, selectable: false, evented: false, opacity: 0.9 },

    // Light mint top-left organic blob
    { type: 'ellipse', left: -200, top: -100, rx: 450, ry: 350, fill: PALETTE.lightMint, selectable: false, evented: false, opacity: 0.6 },

    // Turquoise bottom-left organic accent
    { type: 'ellipse', left: -150, top: 1500, rx: 350, ry: 300, fill: PALETTE.turquoise, selectable: false, evented: false, opacity: 0.5 },

    // --- Title box (center) ---

    // Cyan rounded rectangle for the blog title area
    { type: 'rect', left: 60, top: 620, width: W - 120, height: 520, fill: PALETTE.cyan, rx: 30, ry: 30, selectable: false, evented: false, opacity: 0.7 },

    // --- Editable text elements ---

    // Name — "Judith Dufour Savard"
    {
      type: 'textbox', left: W / 2, top: 160, originX: 'center', originY: 'center',
      text: 'Judith Dufour\nSavard',
      fontFamily: 'Antic Slab', fontSize: 110, fill: PALETTE.darkGreen,
      textAlign: 'center', lineHeight: 0.95,
      width: 800, editable: true, selectable: true,
    },

    // "ACUPUNCTRICE"
    {
      type: 'textbox', left: W / 2, top: 350, originX: 'center', originY: 'center',
      text: 'ACUPUNCTRICE',
      fontFamily: 'Mulish', fontSize: 72, fontWeight: '800', fill: PALETTE.darkGreen,
      textAlign: 'center', charSpacing: 80,
      width: 800, editable: true, selectable: true,
    },

    // "TITRE DU BLOGUE" — main editable title
    {
      type: 'textbox', left: W / 2, top: 780, originX: 'center', originY: 'center',
      text: 'TITRE DU BLOGUE',
      fontFamily: 'Antic Slab', fontSize: 80, fill: PALETTE.charcoal,
      textAlign: 'center',
      width: 860, editable: true, selectable: true,
    },

    // "GORENDEZVOUS.COM/ LASOURCEENSOI"
    {
      type: 'textbox', left: W / 2, top: 1280, originX: 'center', originY: 'center',
      text: 'GORENDEZVOUS.COM/\nLASOURCEENSOI',
      fontFamily: 'Mulish', fontSize: 56, fontWeight: '700', fill: PALETTE.charcoal,
      textAlign: 'center', lineHeight: 1.1, charSpacing: 40,
      width: 800, editable: true, selectable: true,
    },

    // "@LASOURCEENSOI"
    {
      type: 'textbox', left: W / 2, top: 1530, originX: 'center', originY: 'center',
      text: '@LASOURCEENSOI',
      fontFamily: 'Mulish', fontSize: 52, fontWeight: '600', fill: PALETTE.darkGreen,
      textAlign: 'center', charSpacing: 60,
      width: 700, editable: true, selectable: true,
    },
  ];
}
