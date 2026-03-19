import { NextRequest, NextResponse } from 'next/server';

/** Proxy audio Jamendo avec headers CORP/CORS pour le contexte COEP */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL manquante' }, { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ error: 'Audio introuvable' }, { status: response.status });
    }

    const data = await response.arrayBuffer();
    return new NextResponse(data, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') ?? 'audio/mpeg',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Erreur proxy audio' }, { status: 500 });
  }
}
