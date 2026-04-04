import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const RDV_URL = 'https://gorendezvous.com/lasourceensoi';

function buildSystem(role: string, blogUrl: string): string {
  const roleInstr = role === 'reel_resume'
    ? 'Ce Reel RESUME les points cles de l\'article. La caption doit donner envie de lire l\'article complet.'
    : 'Ce Reel donne un CONSEIL PRATIQUE tire de l\'article. La caption doit etre actionnable et utile.';

  return `Tu es un assistant pour Judith, acupunctrice quebecoise a Montreal.
Tu rediges des captions pour des Reels qui promeuvent un article de blog.
Ecris en francais quebecois naturel. Ton chaleureux et professionnel.
IMPORTANT : N'utilise JAMAIS d'emojis. Zero emoji. Texte uniquement.

Contexte : Judith a publie un article de blog. Elle cree des Reels pour
promouvoir l'article sur les reseaux sociaux.

${roleInstr}

Retourne un JSON avec 3 cles : instagram, facebook, youtube.

Regles Instagram :
- Hook percutant + resume du conseil
- CTA : Lien dans ma bio pour prendre rendez-vous
- 3-5 hashtags pertinents

Regles Facebook :
- Ton conversationnel
- Lien vers l'article : ${blogUrl}
- Lien rendez-vous : ${RDV_URL}
- Pas de hashtags

Regles YouTube :
- Titre SEO en premiere ligne
- Lien rendez-vous dans les 2 premieres lignes : ${RDV_URL}
- Lien vers l'article : ${blogUrl}

Retourne UNIQUEMENT du JSON valide :
{"instagram": "...", "facebook": "...", "youtube": "..."}`;
}

/** POST /api/generate-blog-captions — Generate 3 platform captions from blog content */
export async function POST(request: NextRequest) {
  if (!ANTHROPIC_KEY) return NextResponse.json({ error: 'ANTHROPIC_API_KEY manquante' }, { status: 500 });

  const { blogTitle, blogContent, blogUrl, role } = await request.json() as {
    blogTitle?: string; blogContent?: string; blogUrl?: string; role?: string;
  };
  if (!blogTitle || !blogUrl) return NextResponse.json({ error: 'blogTitle et blogUrl requis' }, { status: 400 });

  const system = buildSystem(role || 'reel_resume', blogUrl);
  const userMsg = `Article de blog :\nTitre : ${blogTitle}\n${blogContent ? `\nContenu :\n${blogContent.slice(0, 2000)}` : ''}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, system, messages: [{ role: 'user', content: userMsg }] }),
    });
    if (!res.ok) throw new Error('Claude API echouee');

    const data = await res.json();
    let text = data.content?.[0]?.text || '';
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const captions = JSON.parse(text);
    return NextResponse.json(captions);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Generation echouee' }, { status: 500 });
  }
}
