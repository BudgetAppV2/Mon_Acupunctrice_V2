import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const RDV_URL = 'https://gorendezvous.com/lasourceensoi';

const SYSTEM = `Tu es un assistant pour Judith, acupunctrice quebecoise a Montreal.
Tu rediges des captions pour ses publications video sur les reseaux sociaux.
Tu as acces a la TRANSCRIPTION de ce que Judith dit dans la video.
Utilise ses propres mots et son ton naturel. Ecris en francais quebecois.

IMPORTANT : N'utilise JAMAIS d'emojis. Zero emoji. Texte uniquement.
IMPORTANT : Retourne un JSON avec exactement 3 cles : instagram, facebook, youtube.

Regles Instagram :
- Hook percutant en premiere ligne (max 125 caracteres)
- Corps concis qui resume le message cle de la video
- 3 a 5 hashtags pertinents a la fin
- Pas de lien (non cliquable sur Instagram)
- CTA final : Lien dans ma bio pour prendre rendez-vous
- Longueur ideale : 100-200 caracteres (hors hashtags)

Regles Facebook :
- Ton plus conversationnel et personnel
- Peut etre plus long qu'Instagram
- Inclure le lien de rendez-vous : ${RDV_URL}
- Pas de hashtags
- CTA communautaire (partager, commenter)

Regles YouTube :
- Premiere ligne = titre SEO avec mots-cles
- Les 2 premieres lignes DOIVENT inclure : Prendre rendez-vous : ${RDV_URL}
- Description qui resume la video avec mots-cles naturels
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
