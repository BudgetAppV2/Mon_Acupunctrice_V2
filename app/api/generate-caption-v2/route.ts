import { NextRequest, NextResponse } from 'next/server';
import type { PublishPlatform } from '@/lib/utils/platformOptimization';
import { STYLE_CTAS } from '@/lib/utils/platformOptimization';
import type { ContentStyle } from '@/lib/types';

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const RDV_URL = process.env.NEXT_PUBLIC_WIX_URL || 'https://mon-acupunctrice.ca';

function buildSystemPrompt(platform: PublishPlatform, cta: string): string {
  const base = `Tu es un assistant pour Judith, acupunctrice quebecoise a Montreal.
Tu rediges des captions optimisees pour ses publications sur les reseaux sociaux.
Ecris en francais quebecois naturel. Garde le ton chaleureux et professionnel de Judith.
Termine toujours par ce CTA : "${cta}"`;

  if (platform === 'instagram') {
    return `${base}

Regles Instagram :
- Hook percutant en premiere ligne (max 125 caracteres)
- Corps de la caption concis et engageant
- 3 a 5 hashtags pertinents a la fin (ex: #acupuncture #fertilite #bienetre #montreal)
- Pas de lien cliquable dans la caption (Instagram ne les supporte pas)`;
  }

  if (platform === 'facebook') {
    return `${base}

Regles Facebook :
- Caption plus longue et conversationnelle
- CTA communautaire (partager, commenter, rejoindre)
- Inclure le lien RDV cliquable : ${RDV_URL}
- Pas de hashtags`;
  }

  // youtube
  return `${base}

Regles YouTube :
- Commence par un titre SEO-first avec mots-cles (ex: "Acupuncture et fertilite : 3 points essentiels")
- Description detaillee avec mots-cles naturels
- Inclure le lien RDV cliquable : ${RDV_URL}
- Pas de hashtags dans la description`;
}

/** POST /api/generate-caption-v2 — Appelle Claude directement avec contexte plateforme + style */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, category, notes, captionDraft, platform, contentStyle } = body as {
    title: string;
    category: string;
    notes?: string;
    captionDraft?: string;
    platform: PublishPlatform;
    contentStyle?: ContentStyle;
  };

  if (!title || !category) {
    return NextResponse.json({ error: 'Titre et categorie requis' }, { status: 400 });
  }
  if (!ANTHROPIC_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY non configuree' }, { status: 500 });
  }

  const resolvedPlatform: PublishPlatform = platform || 'instagram';
  const resolvedStyle: ContentStyle = contentStyle || 'enseigner';
  const cta = STYLE_CTAS[resolvedStyle][resolvedPlatform];
  const systemPrompt = buildSystemPrompt(resolvedPlatform, cta);

  const userMessage = captionDraft
    ? `Ameliore cette caption pour ${resolvedPlatform} :\n\nTitre : ${title}\nCategorie : ${category}${notes ? `\nNotes : ${notes}` : ''}\n\nCaption existante :\n${captionDraft}`
    : `Redige une caption pour ${resolvedPlatform} :\n\nTitre : ${title}\nCategorie : ${category}${notes ? `\nNotes : ${notes}` : ''}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!res.ok) return NextResponse.json({ error: 'Generation echouee' }, { status: res.status });

    const data = await res.json();
    const caption = data.content?.[0]?.text || '';
    return NextResponse.json({ caption });
  } catch {
    return NextResponse.json({ error: 'Erreur de generation' }, { status: 500 });
  }
}
