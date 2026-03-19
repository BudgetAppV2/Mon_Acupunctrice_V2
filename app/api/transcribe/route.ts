import { NextRequest, NextResponse } from 'next/server';

const FUNCTIONS_URL = process.env.FIREBASE_FUNCTIONS_URL;

/** Proxy vers la Cloud Function transcribeAudio (Whisper + Claude) */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { storagePath } = body;

  if (!storagePath) {
    return NextResponse.json({ error: 'storagePath requis' }, { status: 400 });
  }
  if (!FUNCTIONS_URL) {
    return NextResponse.json({ error: 'FIREBASE_FUNCTIONS_URL non configurée' }, { status: 500 });
  }

  try {
    const res = await fetch(`${FUNCTIONS_URL}/transcribeAudio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { storagePath, cleanup: true } }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Transcription échouée' }, { status: res.status });
    }

    const json = await res.json();
    return NextResponse.json(json.result || json);
  } catch {
    return NextResponse.json({ error: 'Erreur transcription' }, { status: 500 });
  }
}
