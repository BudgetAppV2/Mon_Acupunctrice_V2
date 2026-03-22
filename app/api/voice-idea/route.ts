import { NextRequest, NextResponse } from 'next/server';

const FUNCTIONS_URL = process.env.FIREBASE_FUNCTIONS_URL;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM_PROMPT = `Tu es un assistant pour Judith, acupunctrice québécoise à Montréal.
Elle vient de dicter une idée de vidéo pour ses réseaux sociaux.

Ton rôle est de STRUCTURER son idée, pas de la réécrire.
Garde son vocabulaire et ses expressions.

À partir du texte dicté, extrais :
1. Un titre court (max 60 caractères) qui résume le sujet
2. Des notes de tournage (points clés, idées visuelles, ce qu'elle veut montrer)
3. Optionnel : une catégorie si elle mentionne un domaine (fertilite, grossesse, bien_etre, mtc, douleur, stress, autre)

Réponds UNIQUEMENT en JSON valide, sans backticks :
{"title": "...", "notes": "...", "category": "..."}`;

/** POST /api/voice-idea — Transcrit l'audio puis structure l'idée avec Claude */
export async function POST(request: NextRequest) {
  const { storagePath } = await request.json();

  if (!storagePath) return NextResponse.json({ error: 'storagePath requis' }, { status: 400 });
  if (!FUNCTIONS_URL) return NextResponse.json({ error: 'FIREBASE_FUNCTIONS_URL non configurée' }, { status: 500 });
  if (!ANTHROPIC_KEY) return NextResponse.json({ error: 'ANTHROPIC_API_KEY non configurée' }, { status: 500 });

  try {
    // 1. Transcrire via Cloud Function Whisper
    const transcribeRes = await fetch(`${FUNCTIONS_URL}/transcribeAudio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { storagePath, cleanup: true } }),
    });
    if (!transcribeRes.ok) throw new Error('Transcription échouée');

    const transcribeData = await transcribeRes.json();
    const subtitles = transcribeData.result?.subtitles || transcribeData.subtitles || [];
    const rawText = subtitles.map((s: { text: string }) => s.text).join(' ').trim();
    if (!rawText) throw new Error('Transcription vide');

    // 2. Structurer avec Claude
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `Texte dicté par Judith :\n${rawText}` }],
      }),
    });
    if (!claudeRes.ok) throw new Error('Structuration échouée');

    const claudeData = await claudeRes.json();
    const text = claudeData.content?.[0]?.text || '';
    const result = JSON.parse(text);

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
