import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy pour servir les vidéos Firebase Storage.
 * Supporte les Range requests pour permettre le seek dans le player vidéo.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL manquante' }, { status: 400 });
  }

  if (!url.includes('firebasestorage.googleapis.com') && !url.includes('storage.googleapis.com')) {
    return NextResponse.json({ error: 'URL non autorisée' }, { status: 403 });
  }

  try {
    // Forward le Range header si présent (pour le seek vidéo)
    const rangeHeader = request.headers.get('Range');
    const fetchHeaders: HeadersInit = {};
    if (rangeHeader) fetchHeaders['Range'] = rangeHeader;

    const response = await fetch(url, { headers: fetchHeaders });
    if (!response.ok && response.status !== 206) {
      return NextResponse.json({ error: 'Vidéo introuvable' }, { status: response.status });
    }

    const data = await response.arrayBuffer();
    const contentType = response.headers.get('Content-Type') ?? 'video/mp4';
    const contentLength = data.byteLength.toString();

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Length': contentLength,
      'Accept-Ranges': 'bytes',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cache-Control': 'public, max-age=3600',
    };

    // Si c'est une réponse partielle (Range request)
    if (response.status === 206) {
      const contentRange = response.headers.get('Content-Range');
      if (contentRange) headers['Content-Range'] = contentRange;
      return new NextResponse(data, { status: 206, headers });
    }

    return new NextResponse(data, { headers });
  } catch {
    return NextResponse.json({ error: 'Erreur lors du proxy' }, { status: 500 });
  }
}
