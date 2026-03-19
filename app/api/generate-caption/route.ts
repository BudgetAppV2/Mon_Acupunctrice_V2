import { NextRequest, NextResponse } from 'next/server';

const FUNCTIONS_URL = process.env.FIREBASE_FUNCTIONS_URL;

/** Proxy vers la Cloud Function generateCaption (Claude) */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, category, notes } = body;

  if (!title || !category) {
    return NextResponse.json({ error: 'Titre et catégorie requis' }, { status: 400 });
  }
  if (!FUNCTIONS_URL) {
    return NextResponse.json({ error: 'FIREBASE_FUNCTIONS_URL non configurée' }, { status: 500 });
  }

  try {
    const res = await fetch(`${FUNCTIONS_URL}/generateCaption`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { title, category, notes } }),
    });

    if (!res.ok) return NextResponse.json({ error: 'Génération échouée' }, { status: res.status });

    const json = await res.json();
    return NextResponse.json(json.result || json);
  } catch {
    return NextResponse.json({ error: 'Erreur de génération' }, { status: 500 });
  }
}
