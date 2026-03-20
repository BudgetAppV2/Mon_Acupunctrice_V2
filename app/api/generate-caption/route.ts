import { NextRequest, NextResponse } from 'next/server';

const FUNCTIONS_URL = process.env.FIREBASE_FUNCTIONS_URL;

/** Proxy vers la Cloud Function generateCaption (Claude).
 * Si captionDraft fourni → enrichissement du texte de Judith.
 * Sinon → generation complete (fallback). */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, category, notes, captionDraft } = body;

  if (!title || !category) {
    return NextResponse.json({ error: 'Titre et categorie requis' }, { status: 400 });
  }
  if (!FUNCTIONS_URL) {
    return NextResponse.json({ error: 'FIREBASE_FUNCTIONS_URL non configuree' }, { status: 500 });
  }

  try {
    const res = await fetch(`${FUNCTIONS_URL}/generateCaption`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: { title, category, notes, captionDraft: captionDraft || undefined },
      }),
    });

    if (!res.ok) return NextResponse.json({ error: 'Generation echouee' }, { status: res.status });

    const json = await res.json();
    return NextResponse.json(json.result || json);
  } catch {
    return NextResponse.json({ error: 'Erreur de generation' }, { status: 500 });
  }
}
