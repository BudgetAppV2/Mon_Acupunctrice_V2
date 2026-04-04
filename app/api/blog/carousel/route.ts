import { NextResponse } from 'next/server';

const WIX_API_KEY = process.env.WIX_API_KEY;
const WIX_SITE_ID = process.env.WIX_SITE_ID;

/** GET /api/blog/carousel — Returns latest blog posts for the Wix carousel embed.
 *  CORS enabled so the Wix HTML embed can fetch from mon-acupunctrice-v2.vercel.app */
export async function GET() {
  if (!WIX_API_KEY || !WIX_SITE_ID) {
    return NextResponse.json({ error: 'Config manquante' }, { status: 500 });
  }

  try {
    const res = await fetch('https://www.wixapis.com/blog/v3/posts/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': WIX_API_KEY,
        'wix-site-id': WIX_SITE_ID,
      },
      body: JSON.stringify({
        query: { paging: { limit: 8 } },
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Wix API error' }, { status: res.status });
    }

    const data = await res.json();
    interface WixImage { url?: string }
    interface WixMedia { wixMedia?: { image?: WixImage } }
    interface WixUrl { base?: string; path?: string }
    interface WixPost {
      id: string; title: string; firstPublishedDate?: string;
      media?: WixMedia; url?: WixUrl; slug?: string;
    }

    const posts = (data.posts || []).map((p: WixPost) => ({
      title: p.title,
      date: p.firstPublishedDate ? new Date(p.firstPublishedDate).toLocaleDateString('fr-CA', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
      image: p.media?.wixMedia?.image?.url || '',
      url: p.url ? `${p.url.base}${p.url.path}` : `https://www.acupuncturejudith.ca/post/${p.slug || ''}`,
    }));

    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET');
    headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    return NextResponse.json({ posts }, { headers });
  } catch {
    return NextResponse.json({ error: 'Erreur carousel' }, { status: 500 });
  }
}
