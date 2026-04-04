import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM = `Tu es un expert SEO pour une acupunctrice quebecoise a Montreal.
A partir du titre et du contenu d'un article de blog, genere exactement
3 questions-reponses FAQ qui ciblent les "People Also Ask" de Google.

Regles :
- Les questions doivent etre celles qu'un patient potentiel poserait
- Les questions doivent commencer par "Est-ce que", "Combien", "Comment",
  "Pourquoi", "A quel age", etc.
- Les reponses doivent etre concises (40-60 mots maximum)
- Les reponses doivent mentionner "acupuncture" et le sujet de l'article
- Ecris en francais quebecois naturel
- N'utilise JAMAIS d'emojis
- La derniere phrase de chaque reponse doit orienter vers la prise
  de rendez-vous : "N'hesitez pas a consulter pour en savoir plus."

Retourne UNIQUEMENT du JSON valide :
{
  "faqs": [
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." }
  ]
}`;

/** POST /api/generate-blog-faq — Generate 3 SEO FAQ from blog content */
export async function POST(request: NextRequest) {
  if (!ANTHROPIC_KEY) return NextResponse.json({ error: 'ANTHROPIC_API_KEY manquante' }, { status: 500 });

  const { title, content } = await request.json() as { title?: string; content?: string };
  if (!title) return NextResponse.json({ error: 'Titre requis' }, { status: 400 });

  const userMsg = `Article de blog :\nTitre : ${title}\n${content ? `\nContenu :\n${content.slice(0, 3000)}` : ''}`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 800, system: SYSTEM, messages: [{ role: 'user', content: userMsg }] }),
    });
    if (!res.ok) throw new Error('Claude API echouee');

    const data = await res.json();
    let text = data.content?.[0]?.text || '';
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(text) as { faqs?: { question: string; answer: string }[] };
    return NextResponse.json({ faqs: parsed.faqs || [] });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Generation FAQ echouee' }, { status: 500 });
  }
}
