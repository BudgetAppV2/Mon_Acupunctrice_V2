import { NextRequest, NextResponse } from 'next/server';

const FUNCTIONS_URL = process.env.FIREBASE_FUNCTIONS_URL;

/** Proxy vers la Cloud Function publishToInstagram */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { videoUrl, caption, itemId, coverOption, thumbOffset, coverUrl } = body;

  if (!videoUrl || !caption || !itemId) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }
  if (!FUNCTIONS_URL) {
    return NextResponse.json({ error: 'FIREBASE_FUNCTIONS_URL non configurée' }, { status: 500 });
  }

  try {
    console.log('[API/publish] Calling CF publishToInstagram for', itemId);
    const res = await fetch(`${FUNCTIONS_URL}/publishToInstagram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { videoUrl, caption, itemId, coverOption, thumbOffset, coverUrl } }),
    });

    console.log('[API/publish] CF response status:', res.status);
    if (!res.ok) {
      const errText = await res.text().catch(() => 'no body');
      console.error('[API/publish] CF error:', errText.substring(0, 500));
      return NextResponse.json({ error: 'Publication échouée', details: errText.substring(0, 200) }, { status: res.status });
    }

    const json = await res.json();
    console.log('[API/publish] CF success keys:', Object.keys(json));
    return NextResponse.json(json.result || json);
  } catch (e) {
    console.error('[API/publish] Exception:', e);
    return NextResponse.json({ error: 'Erreur de publication' }, { status: 500 });
  }
}
