import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { getRdvUrl, slugify } from '@/lib/utils/rdvUrl';
import { htmlToMarkdownText } from '@/lib/utils/ricosConverter';
import { FieldValue } from 'firebase-admin/firestore';
import { detectPilierFromCategory } from '@/lib/utils/detectPilier';

interface FaqItem { question: string; answer: string }

/** POST /api/blog/publish — Publie un article dans Firestore publicBlog */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      title?: string;
      content?: string;
      category?: string;
      ctaUrl?: string;
      faqs?: FaqItem[];
      coverImageUrl?: string;
      pilier?: string;
    };
    const { title, content, category, coverImageUrl } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Titre et contenu requis' }, { status: 400 });
    }

    const slug = slugify(title);
    const ctaUrl = body.ctaUrl || getRdvUrl({ source: 'blog', medium: 'article', campaign: slug });

    // Generate FAQ if not provided
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

    // Convert HTML to markdown (le site public rend du markdown)
    const markdown = htmlToMarkdownText(content);
    const excerpt = markdown.replace(/[#\-*]/g, '').trim().slice(0, 160);

    // Append CTA to markdown content
    const contentWithCta = `${markdown}\n\n---\n\nPrendre rendez-vous : ${ctaUrl}`;

    const db = getAdminFirestore();
    const docRef = db.collection('publicBlog').doc(slug);

    await docRef.set({
      title,
      slug,
      content: contentWithCta,
      excerpt,
      coverImage: coverImageUrl || '',
      author: 'Judith Dufour-Savard',
      category: category || 'Acupuncture',
      tags: [],
      status: 'pending',
      relatedServices: [],
      relatedFaqs: [],
      relatedArticles: [],
      faqs: faqs || [],
      // publishedAt sera set par /api/cms/approve quand Judith approuve
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    });

    // M2A: hybrid sync/async cover generation (A5)
    const pilier = (body.pilier as string) || detectPilierFromCategory(category);
    let firstProposal = null;
    try {
      const { generateCovers } = await import('@/lib/cover-generator/compose');
      const result = await generateCovers({
        contentId: `${slug}/p1`,
        type: 'blog',
        titre: title,
        pilier: pilier as 'transversal',
        uploadPrefix: 'proposals',
      });
      firstProposal = {
        proposalId: 'p1',
        coverUrl: result.cover16x9,
        storyUrl: result.story9x16,
        combo: { backgroundFile: result.assets.backgroundFile, lineartFile: result.assets.lineartFile },
        generatedAt: result.metadata.generatedAt,
      };
      await docRef.update({ imageProposals: [firstProposal], regenerationCount: 0 });
    } catch (coverErr) {
      console.error('[blog/publish] First cover generation failed:', coverErr);
    }

    // 3 alternatives async (fire-and-forget)
    fetch(new URL('/api/cover/generate-proposals', request.url).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        type: 'blog',
        titre: title,
        pilier,
        count: 3,
        startIndex: 2,
        excludeBgs: firstProposal ? [firstProposal.combo.backgroundFile] : [],
        excludeLas: firstProposal ? [firstProposal.combo.lineartFile] : [],
      }),
    }).catch(() => { /* silent — async generation */ });

    return NextResponse.json({
      success: true,
      postId: slug,
      postUrl: `/blog/${slug}`,
      status: 'pending',
      reviewUrl: '/contenu',
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur publication';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
