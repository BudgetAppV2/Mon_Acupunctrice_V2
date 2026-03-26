import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const WIX_URL = process.env.NEXT_PUBLIC_WIX_URL || 'https://mon-acupunctrice.ca';

const SYSTEM = `Tu es un assistant pour Judith, acupunctrice québécoise à Montréal.
Tu rédiges des captions pour ses publications vidéo sur les réseaux sociaux.
Tu as accès à la TRANSCRIPTION de ce que Judith dit dans la vidéo.
Utilise ses propres mots et son ton naturel. Écris en français québécois.

IMPORTANT : Retourne un JSON avec exactement 3 clés : instagram, facebook, youtube.

Règles Instagram :
- Hook percutant en première ligne (max 125 caractères)
- Corps concis qui résume le message clé de la vidéo
- 3 à 5 hashtags pertinents à la fin
- Pas de lien (non cliquable sur Instagram)
- Longueur idéale : 100-200 caractères (hors hashtags)

Règles Facebook :
- Ton plus conversationnel et personnel
- Peut être plus long qu'Instagram
- Inclure le lien de rendez-vous : ${WIX_URL}
- Pas de hashtags
- CTA communautaire (partager, commenter)

Règles YouTube :
- Première ligne = titre SEO avec mots-clés
- Description qui résume la vidéo avec mots-clés naturels
- Inclure "Prendre rendez-vous : ${WIX_URL}"
- Format Shorts-friendly

Retourne UNIQUEMENT du JSON valide :
{"instagram": "...", "facebook": "...", "youtube": "..."}`;

/** POST /api/generate-captions — genere 3 captions en un seul appel Claude */
export async function POST(request: NextRequest) {
  if (!ANTHROPIC_KEY) return NextResponse.json({ error: 'ANTHROPIC_API_KEY manquante' }, { status: 500 });

  const { transcript, title, category, contentStyle, notes } = await request.json();
  if (!title) return NextResponse.json({ error: 'Titre requis' }, { status: 400 });

  const parts = [];
  if (transcript) parts.push(`Transcription de la video :\n"${transcript}"`);
  parts.push(`Titre : ${title}`);
  if (category) parts.push(`Categorie : ${category}`);
  if (contentStyle) parts.push(`Style : ${contentStyle}`);
  if (notes) parts.push(`Notes : ${notes}`);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, system: SYSTEM, messages: [{ role: 'user', content: parts.join('\n') }] }),
    });
    if (!res.ok) throw new Error('Claude API echouee');

    const data = await res.json();
    let text = data.content?.[0]?.text || '';
    // Strip markdown backticks si presents
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const captions = JSON.parse(text);

    return NextResponse.json(captions);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Generation echouee' }, { status: 500 });
  }
}
