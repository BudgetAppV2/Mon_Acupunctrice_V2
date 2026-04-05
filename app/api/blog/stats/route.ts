import { NextResponse } from 'next/server';

const WIX_API_KEY = process.env.WIX_API_KEY;
const WIX_SITE_ID = process.env.WIX_SITE_ID;
const WIX_BASE = 'https://www.wixapis.com/blog/v3';

function wixHeaders(): Record<string, string> {
  return { 'Authorization': WIX_API_KEY!, 'wix-site-id': WIX_SITE_ID! };
}

interface WixPost {
  id: string;
  title: string;
  firstPublishedDate?: string;
  url?: { base: string; path: string };
  media?: { wixMedia?: { image?: { url: string } } };
}

interface WixMetrics { metrics?: { views?: number; likes?: number; comments?: number }; post?: { metrics?: { views?: number; likes?: number; comments?: number } } }

/** GET /api/blog/stats — Blog posts with metrics from Wix */
export async function GET() {
  if (!WIX_API_KEY || !WIX_SITE_ID) {
    return NextResponse.json({ error: 'WIX_API_KEY ou WIX_SITE_ID manquant' }, { status: 500 });
  }

  try {
    // Fetch all posts
    const listRes = await fetch(`${WIX_BASE}/posts?paging.limit=50&sort.fieldName=firstPublishedDate&sort.order=DESC`, {
      headers: wixHeaders(),
    });
    if (!listRes.ok) return NextResponse.json({ error: 'Wix list failed' }, { status: listRes.status });
    const listData = await listRes.json() as { posts?: WixPost[] };
    const wixPosts = listData.posts || [];

    // Fetch metrics for each post
    const posts = await Promise.all(wixPosts.map(async (p) => {
      let views = 0, likes = 0, comments = 0;
      try {
        const mRes = await fetch(`${WIX_BASE}/posts/${p.id}/metrics`, { headers: wixHeaders() });
        if (mRes.ok) {
          const mData = await mRes.json() as WixMetrics;
          const m = mData.metrics || mData.post?.metrics;
          views = m?.views || 0;
          likes = m?.likes || 0;
          comments = m?.comments || 0;
        }
      } catch { /* skip metrics error for this post */ }
      return {
        id: p.id,
        title: p.title,
        date: p.firstPublishedDate || null,
        url: p.url ? `${p.url.base}${p.url.path}` : null,
        image: p.media?.wixMedia?.image?.url || null,
        views, likes, comments,
      };
    }));

    const totals = {
      views: posts.reduce((s, p) => s + p.views, 0),
      likes: posts.reduce((s, p) => s + p.likes, 0),
      comments: posts.reduce((s, p) => s + p.comments, 0),
      posts: posts.length,
    };

    return NextResponse.json({ posts, totals }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' },
    });
  } catch {
    return NextResponse.json({ error: 'Erreur stats blog' }, { status: 500 });
  }
}
