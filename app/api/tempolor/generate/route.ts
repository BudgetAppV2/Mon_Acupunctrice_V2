import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.TEMPOLAR_API_KEY;
const BASE_URL = 'https://api.tempolor.com';

export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'TEMPOLAR_API_KEY non configuree' }, { status: 500 });
  }

  try {
    const body = await request.json() as { prompt?: string; model?: string };
    if (!body.prompt) {
      return NextResponse.json({ error: 'Prompt requis' }, { status: 400 });
    }

    const res = await fetch(`${BASE_URL}/open-apis/v1/instrumental/generate`, {
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        prompt: body.prompt,
        model: body.model || 'TemPolor i3.5',
        callback_url: 'https://mon-acupunctrice-v2.vercel.app/api/tempolor/callback',
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Erreur TemPolor' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Erreur generation' }, { status: 500 });
  }
}
