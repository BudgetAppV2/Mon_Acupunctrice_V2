import { NextResponse } from 'next/server';

const WIX_API_KEY = process.env.WIX_API_KEY;
const WIX_SITE_ID = process.env.WIX_SITE_ID;

interface WixPost {
  id: string;
  title: string;
  published: boolean;
  firstPublishedDate?: string;
  url?: { base: string; path: string };
}

/** GET /api/blog/list — List Wix blog posts */
export async function GET() {
  if (!WIX_API_KEY || !WIX_SITE_ID) {
    return NextResponse.json({ error: 'WIX_API_KEY ou WIX_SITE_ID manquant' }, { status: 500 });
  }

  try {
    const res = await fetch('https://www.wixapis.com/blog/v3/posts?paging.limit=50&sort.fieldName=firstPublishedDate&sort.order=DESC', {
      headers: {
        'Authorization': WIX_API_KEY,
        'wix-site-id': WIX_SITE_ID,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Wix API error: ${res.status}`, details: err }, { status: res.status });
    }

    const data = await res.json() as { posts?: WixPost[] };
    const posts = (data.posts || []).map(p => ({
      id: p.id,
      title: p.title,
      published: p.published,
      firstPublishedDate: p.firstPublishedDate || null,
      url: p.url ? `${p.url.base}${p.url.path}` : null,
    }));

    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ error: 'Erreur listing blog' }, { status: 500 });
  }
}
