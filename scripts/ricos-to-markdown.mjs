/**
 * Ricos JSON → Markdown converter
 * =================================
 *
 * Module reutilisable. Convertit le format Ricos v3 (Wix Blog) en markdown.
 *
 * Noeuds supportes (decouverts dans les 11 articles MW-A1a) :
 *   HEADING, PARAGRAPH, TEXT, IMAGE, BULLETED_LIST, LIST_ITEM,
 *   BLOCKQUOTE, BUTTON, CAPTION
 *
 * Decorations TEXT supportees : BOLD, ITALIC, LINK
 * Decorations ignorees : UNDERLINE, COLOR (pas d'equivalent markdown)
 *
 * Usage :
 *   import { ricosToMarkdown, extractImageUrlsFromRicos } from './ricos-to-markdown.mjs';
 *   const md = ricosToMarkdown(post.richContent);
 */

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────

/**
 * Convertit un Ricos richContent en markdown.
 * @param {{ nodes: object[] }} richContent
 * @returns {string} markdown propre
 */
export function ricosToMarkdown(richContent) {
  if (!richContent || !Array.isArray(richContent.nodes)) return '';

  const lines = [];
  for (const node of richContent.nodes) {
    const result = parseNode(node);
    if (result !== null) lines.push(result);
  }

  // Joindre avec double saut de ligne, nettoyer les sauts triples+
  return lines.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Extrait toutes les URLs d'images inline du Ricos JSON, dans l'ordre
 * d'apparition. Meme algorithme que export-wix-blog.mjs pour garantir
 * le mapping inline-N ↔ URL.
 * @param {{ nodes: object[] }} richContent
 * @returns {string[]} URLs (format https://static.wixstatic.com/media/...)
 */
export function extractImageUrlsFromRicos(richContent) {
  if (!richContent || !Array.isArray(richContent.nodes)) return [];
  return collectImageUrls(richContent.nodes);
}

// ─────────────────────────────────────────────────────────────
// Internal — node parsing
// ─────────────────────────────────────────────────────────────

function parseNode(node) {
  if (!node || typeof node !== 'object') return null;

  switch (node.type) {
    case 'HEADING':
      return parseHeading(node);
    case 'PARAGRAPH':
      return parseParagraph(node);
    case 'BULLETED_LIST':
      return parseBulletedList(node);
    case 'BLOCKQUOTE':
      return parseBlockquote(node);
    case 'IMAGE':
      return parseImage(node);
    case 'BUTTON':
      return parseButton(node);
    case 'CAPTION':
      return parseCaption(node);
    default:
      // Type non reconnu — log warning, skip
      if (node.type !== 'TEXT' && node.type !== 'LIST_ITEM') {
        process.stderr.write(`  [ricos-parser] Unknown node type: ${node.type}\n`);
      }
      return null;
  }
}

function parseHeading(node) {
  const level = node.headingData?.level || 2;
  const text = parseChildren(node.nodes);
  if (!text) return null; // heading vide = separateur visuel Wix, skip
  return '#'.repeat(level) + ' ' + text;
}

function parseParagraph(node) {
  return parseChildren(node.nodes);
}

function parseBulletedList(node) {
  if (!Array.isArray(node.nodes)) return null;
  const items = node.nodes
    .filter((n) => n.type === 'LIST_ITEM')
    .map((item) => {
      // LIST_ITEM contient un PARAGRAPH qui contient des TEXT
      const para = item.nodes?.[0];
      const text = para ? parseChildren(para.nodes) : '';
      return '- ' + text;
    });
  return items.length > 0 ? items.join('\n') : null;
}

function parseBlockquote(node) {
  // BLOCKQUOTE contient un PARAGRAPH
  const para = node.nodes?.[0];
  const text = para ? parseChildren(para.nodes) : '';
  return text ? '> ' + text : null;
}

function parseImage(node) {
  const src = node.imageData?.image?.src;
  let url;
  if (!src) return null;
  if (typeof src === 'string') {
    url = src;
  } else if (src.id) {
    url = `https://static.wixstatic.com/media/${src.id}`;
  } else {
    return null;
  }
  const alt = node.imageData?.altText || '';
  return `![${alt}](${url})`;
}

function parseButton(node) {
  const text = node.buttonData?.text || 'Lien';
  const url = node.buttonData?.link?.url || '';
  if (!url) return null;
  return `[${text}](${url})`;
}

function parseCaption(node) {
  const text = parseChildren(node.nodes);
  return text ? `*${text}*` : null;
}

// ─────────────────────────────────────────────────────────────
// Internal — text + decorations
// ─────────────────────────────────────────────────────────────

function parseChildren(nodes) {
  if (!Array.isArray(nodes) || nodes.length === 0) return '';
  return nodes
    .filter((n) => n.type === 'TEXT')
    .map(parseTextNode)
    .join('');
}

function parseTextNode(node) {
  let text = node.textData?.text || '';
  if (!text) return '';

  const decorations = node.textData?.decorations || [];

  // Appliquer les decorations — LINK en premier (outermost), puis BOLD/ITALIC
  const hasLink = decorations.find((d) => d.type === 'LINK');
  const hasBold = decorations.some((d) => d.type === 'BOLD');
  const hasItalic = decorations.some((d) => d.type === 'ITALIC');

  if (hasBold) text = `**${text}**`;
  if (hasItalic) text = `*${text}*`;
  if (hasLink) {
    const url = hasLink.linkData?.link?.url || '';
    if (url) text = `[${text}](${url})`;
  }

  return text;
}

// ─────────────────────────────────────────────────────────────
// Internal — image URL extraction (same order as export-wix-blog.mjs)
// ─────────────────────────────────────────────────────────────

function collectImageUrls(nodes) {
  const urls = [];
  if (!Array.isArray(nodes)) return urls;
  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue;
    if (node.type === 'IMAGE' && node.imageData?.image?.src) {
      const src = node.imageData.image.src;
      if (typeof src === 'string') {
        urls.push(src.startsWith('http') ? src : `https://static.wixstatic.com/media/${src}`);
      } else if (src.id) {
        urls.push(`https://static.wixstatic.com/media/${src.id}`);
      }
    }
    if (Array.isArray(node.nodes)) {
      urls.push(...collectImageUrls(node.nodes));
    }
  }
  return urls;
}
