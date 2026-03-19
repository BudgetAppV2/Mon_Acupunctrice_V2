import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy pour servir les vidéos Firebase Storage avec les headers CORP.
 * Nécessaire car COEP (require-corp) empêche le chargement direct
 * des ressources cross-origin par FFmpeg.wasm.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL manquante' }, { status: 400 });
  }

  // Valider que l'URL pointe vers Firebase Storage
  if (!url.includes('firebasestorage.googleapis.com') && !url.includes('storage.googleapis.com')) {
    return NextResponse.json({ error: 'URL non autorisée' }, { status: 403 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ error: 'Vidéo introuvable' }, { status: response.status });
    }

    const data = await response.arrayBuffer();
    return new NextResponse(data, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') ?? 'video/mp4',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Erreur lors du proxy' }, { status: 500 });
  }
}
