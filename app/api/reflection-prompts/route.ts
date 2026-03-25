import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM_PROMPT = `Tu es un réalisateur bienveillant qui aide Judith, une acupunctrice québécoise, à trouver des idées de contenu pour ses réseaux sociaux.

RÈGLES STRICTES :
- Tu génères UNIQUEMENT des questions courtes (max 15 mots) qui se terminent par "?"
- Chaque question doit faire réfléchir Judith à un moment vécu, un souvenir, une émotion ou une expérience concrète de sa pratique
- Tu ne génères JAMAIS de formule marketing, de template, de hashtag, de CTA, de conseil, d'introduction, de conclusion, ou de commentaire
- Tu ne génères JAMAIS de phrase qui commence par un verbe à l'impératif comme "Enregistre", "Partage", "Essaie"
- Chaque question doit être unique et différente des autres
- Le ton est celui d'une amie curieuse, pas d'une agence marketing
- Réponds SEULEMENT avec les questions, une par ligne, rien d'autre

EXEMPLES DE BONNES QUESTIONS :
- Quel moment de ta semaine t'a fait sourire en clinique?
- Qu'est-ce qui surprend le plus tes nouvelles clientes?
- Quelle habitude simple changes-tu souvent chez tes patientes?

EXEMPLES DE CE QUE TU NE DOIS JAMAIS GÉNÉRER :
- "Savais-tu que [fait surprenant]?" (c'est un template)
- "Voici 4 questions qui vont t'aider..." (c'est une intro)
- "#acupuncture #contenu" (c'est des hashtags)
- "Enregistre ce post" (c'est un CTA)
- "Ton vécu, c'est ton trésor!" (c'est un encouragement, pas une question)`;

export async function POST(request: NextRequest) {
  const { styleInstruction, styleLabel } = await request.json();

  if (!ANTHROPIC_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY manquante' }, { status: 500 });
  }

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
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: `${styleInstruction}\n\nStyle de contenu visé : ${styleLabel}.\nRappel : SEULEMENT des questions courtes qui se terminent par "?". Rien d'autre.`,
        }],
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Génération échouée' }, { status: res.status });
    }

    const data = await res.json();
    const raw = data.content?.[0]?.text || '';

    // Filtre agressif : garde uniquement les lignes qui sont des questions
    const questions = raw
      .split('\n')
      .map((l: string) => l.replace(/^[-•*\d.)\s]+/, '').trim())
      .filter((l: string) => l.endsWith('?') && l.length > 10 && l.length < 120);

    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json({ error: 'Erreur de génération' }, { status: 500 });
  }
}
