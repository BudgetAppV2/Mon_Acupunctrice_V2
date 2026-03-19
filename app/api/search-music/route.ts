import { NextRequest, NextResponse } from 'next/server';

const FUNCTIONS_URL = process.env.FIREBASE_FUNCTIONS_URL;

/** Proxy vers la Cloud Function searchJamendo */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  const mood = request.nextUrl.searchParams.get('mood');

  if (!FUNCTIONS_URL) {
    return NextResponse.json({ error: 'FIREBASE_FUNCTIONS_URL non configurée' }, { status: 500 });
  }

  try {
    const res = await fetch(`${FUNCTIONS_URL}/searchJamendo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { query: q || undefined, tags: mood || undefined } }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Recherche échouée' }, { status: res.status });
    }

    const json = await res.json();
    return NextResponse.json(json.result || json);
  } catch {
    return NextResponse.json({ error: 'Erreur recherche musique' }, { status: 500 });
  }
}
