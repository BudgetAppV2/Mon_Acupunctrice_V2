import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { getRdvUrl, slugify } from '@/lib/utils/rdvUrl';
import { htmlToMarkdownText } from '@/lib/utils/ricosConverter';
import { FieldValue } from 'firebase-admin/firestore';

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
