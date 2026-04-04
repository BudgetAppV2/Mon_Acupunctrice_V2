import { NextRequest, NextResponse } from 'next/server';
import { textToRicos, type FaqItem } from '@/lib/utils/ricosConverter';

const WIX_API_KEY = process.env.WIX_API_KEY;
const WIX_SITE_ID = process.env.WIX_SITE_ID;
const WIX_MEMBER_ID = process.env.WIX_MEMBER_ID;
const RDV_URL = 'https://gorendezvous.com/lasourceensoi';

const WIX_BASE = 'https://www.wixapis.com/blog/v3';

function wixHeaders(): Record<string, string> {
  return {
    'Authorization': WIX_API_KEY!,
    'wix-site-id': WIX_SITE_ID!,
    'Content-Type': 'application/json',
  };
}

/** POST /api/blog/publish — Create and publish a blog post on Wix */
export async function POST(request: NextRequest) {
  if (!WIX_API_KEY || !WIX_SITE_ID) {
    return NextResponse.json({ error: 'WIX_API_KEY ou WIX_SITE_ID manquant' }, { status: 500 });
  }

  try {
    const body = await request.json() as { title?: string; content?: string; category?: string; ctaUrl?: string; faqs?: FaqItem[] };
    const { title, content, category } = body;
    const ctaUrl = body.ctaUrl || RDV_URL;

    if (!title || !content) {
      return NextResponse.json({ error: 'Titre et contenu requis' }, { status: 400 });
    }

    // Generate FAQ if not provided (non-blocking fallback)
    let faqs = body.faqs;
    if (!faqs || faqs.length === 0) {
      try {
        const faqRes = await fetch(new URL('/api/generate-blog-faq', request.url), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
        });
        if (faqRes.ok) {
          const faqData = await faqRes.json() as { faqs?: FaqItem[] };
          faqs = faqData.faqs;
        }
      } catch { /* FAQ generation failed — publish without */ }
    }

    // Convert plain text to Ricos JSON (with FAQ if available)
    const richContent = textToRicos(content, ctaUrl, faqs);

    // Step 1: Create draft post
    const draftRes = await fetch(`${WIX_BASE}/draft-posts`, {
      method: 'POST',
      headers: wixHeaders(),
      body: JSON.stringify({
        draftPost: {
          title,
          richContent,
          ...(WIX_MEMBER_ID ? { memberId: WIX_MEMBER_ID } : {}),
          ...(category ? { categoryIds: [] } : {}), // Wix categories are IDs, not names — skip for now
        },
      }),
    });

    if (!draftRes.ok) {
      const err = await draftRes.text();
      return NextResponse.json({ error: 'Creation brouillon echouee', details: err }, { status: draftRes.status });
    }

    const draftData = await draftRes.json() as { draftPost?: { id?: string } };
    const draftId = draftData.draftPost?.id;
    if (!draftId) {
      return NextResponse.json({ error: 'Pas de draftId retourne' }, { status: 500 });
    }

    // Step 2: Publish the draft
    const publishRes = await fetch(`${WIX_BASE}/draft-posts/${draftId}/publish`, {
      method: 'POST',
      headers: wixHeaders(),
    });

    if (!publishRes.ok) {
      const err = await publishRes.text();
      return NextResponse.json({ error: 'Publication echouee', details: err }, { status: publishRes.status });
    }

    const publishData = await publishRes.json() as { post?: { id?: string; url?: { base?: string; path?: string } } };
    const postId = publishData.post?.id || draftId;
    const postUrl = publishData.post?.url
      ? `${publishData.post.url.base}${publishData.post.url.path}`
      : `https://acupuncturejudith.ca/post/${draftId}`;

    return NextResponse.json({ success: true, postId, postUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur publication';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
