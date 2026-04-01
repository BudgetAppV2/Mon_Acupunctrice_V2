import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.TEMPOLAR_API_KEY;
const BASE_URL = 'https://api.tempolor.com';

export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'TEMPOLAR_API_KEY non configuree' }, { status: 500 });
  }

  try {
    const body = await request.json() as { item_ids?: string[] };
    if (!body.item_ids?.length) {
      return NextResponse.json({ error: 'item_ids requis' }, { status: 400 });
    }

    const res = await fetch(`${BASE_URL}/open-apis/v1/instrumental/query`, {
      method: 'POST',
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({ item_ids: body.item_ids }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Erreur TemPolor query' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Erreur status' }, { status: 500 });
  }
}
