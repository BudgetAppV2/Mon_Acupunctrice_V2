/**
 * Converts plain text to Wix Ricos JSON format.
 * Supports: paragraphs, headings (#), bullet lists (- or *), and CTA link.
 */

interface RicosNode {
  type: string;
  nodes?: RicosNode[];
  textData?: { text: string; decorations?: { type: string; linkData?: { link: { url: string; target: string } } }[] };
  headingData?: { level: number };
  paragraphData?: Record<string, never>;
  bulletedListData?: Record<string, never>;
}

interface RicosContent {
  nodes: RicosNode[];
}

function textNode(text: string): RicosNode {
  return { type: 'TEXT', textData: { text } };
}

function linkTextNode(text: string, url: string): RicosNode {
  return {
    type: 'TEXT',
    textData: {
      text,
      decorations: [{ type: 'LINK', linkData: { link: { url, target: '_blank' } } }],
    },
  };
}

function paragraphNode(text: string): RicosNode {
  return { type: 'PARAGRAPH', paragraphData: {}, nodes: [textNode(text)] };
}

function headingNode(text: string, level = 2): RicosNode {
  return { type: 'HEADING', headingData: { level }, nodes: [textNode(text)] };
}

function bulletItemNode(text: string): RicosNode {
  return { type: 'BULLETED_LIST', bulletedListData: {}, nodes: [{ type: 'LIST_ITEM', nodes: [{ type: 'PARAGRAPH', paragraphData: {}, nodes: [textNode(text)] }] }] };
}

export interface FaqItem { question: string; answer: string }

function faqNodes(faqs: FaqItem[]): RicosNode[] {
  const nodes: RicosNode[] = [];
  nodes.push(headingNode('Questions frequentes', 2));
  for (const faq of faqs) {
    nodes.push(headingNode(faq.question, 3));
    nodes.push(paragraphNode(faq.answer));
  }
  return nodes;
}

export function textToRicos(text: string, ctaUrl: string, faqs?: FaqItem[]): RicosContent {
  const lines = text.split('\n');
  const nodes: RicosNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trimEnd();

    // Empty line — skip (paragraph separator)
    if (line.trim() === '') { i++; continue; }

    // Heading: lines starting with # or ##
    if (line.startsWith('## ')) {
      nodes.push(headingNode(line.slice(3).trim()));
      i++; continue;
    }
    if (line.startsWith('# ')) {
      nodes.push(headingNode(line.slice(2).trim()));
      i++; continue;
    }

    // Bullet list: lines starting with - or *
    if (line.startsWith('- ') || line.startsWith('* ')) {
      // Collect consecutive list items
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        nodes.push(bulletItemNode(lines[i].slice(2).trim()));
        i++;
      }
      continue;
    }

    // Regular paragraph — collect consecutive non-empty, non-special lines
    let para = line;
    i++;
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].startsWith('#') && !lines[i].startsWith('- ') && !lines[i].startsWith('* ')) {
      para += ' ' + lines[i].trimEnd();
      i++;
    }
    nodes.push(paragraphNode(para));
  }

  // FAQ section (before CTA)
  if (faqs && faqs.length > 0) {
    nodes.push({ type: 'PARAGRAPH', paragraphData: {}, nodes: [] });
    nodes.push(...faqNodes(faqs));
  }

  // CTA paragraph with clickable link
  nodes.push({ type: 'PARAGRAPH', paragraphData: {}, nodes: [] }); // empty separator
  nodes.push({
    type: 'PARAGRAPH', paragraphData: {},
    nodes: [
      textNode('Prendre rendez-vous : '),
      linkTextNode(ctaUrl, ctaUrl),
    ],
  });

  return { nodes };
}

/** Convert tiptap HTML output to markdown-style text for textToRicos() */
export function htmlToMarkdownText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n# $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n## $1\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1')
    .replace(/<ul[^>]*>|<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>|<\/ol>/gi, '\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '$1')
    .replace(/<em>(.*?)<\/em>/gi, '$1')
    .replace(/<u>(.*?)<\/u>/gi, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
