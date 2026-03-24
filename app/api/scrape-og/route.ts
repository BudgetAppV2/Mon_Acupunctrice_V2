import { NextRequest, NextResponse } from 'next/server';

/** GET /api/scrape-og?url=https://...
 * Extrait og:title, og:image, og:description d'une URL externe.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ title: '', imageUrl: '', description: '' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MonAcupunctrice/1.0)',
        Accept: 'text/html',
      },
      // Timeout implicite Next.js fetch — pas de signal nécessaire en serverless
    });

    if (!res.ok) {
      return NextResponse.json({ title: '', imageUrl: '', description: '' });
    }

    const html = await res.text();

    const ogTitle = extractMeta(html, 'og:title') || extractTitle(html);
    const ogImage = extractMeta(html, 'og:image') || '';
    const ogDescription = extractMeta(html, 'og:description') || '';

    return NextResponse.json({ title: ogTitle, imageUrl: ogImage, description: ogDescription });
  } catch {
    return NextResponse.json({ title: '', imageUrl: '', description: '' });
  }
}

function extractMeta(html: string, property: string): string {
  // Cherche <meta property="og:..." content="..."> ou <meta name="og:..." content="...">
  const regex = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
    'i',
  );
  const alt = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
    'i',
  );
  const m = html.match(regex) || html.match(alt);
  return m ? m[1].trim() : '';
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].trim() : '';
}
