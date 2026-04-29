import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { slugify } from '@/lib/utils/rdvUrl';

/** GET /api/cms/ressources — Liste toutes les ressources */
export async function GET() {
  const db = getAdminFirestore();
  const snap = await db.collection('ressources').orderBy('updatedAt', 'desc').get();
  const ressources = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json({ ressources });
}

/** POST /api/cms/ressources — Cree une nouvelle ressource */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title } = body as { title?: string };
  if (!title) return NextResponse.json({ error: 'title requis' }, { status: 400 });

  const slug = body.slug || slugify(title);
  const db = getAdminFirestore();
  const docRef = db.collection('ressources').doc(slug);

  await docRef.set({
    title,
    slug,
    type: body.type || 'guide',
    pilier: body.pilier || 'transversal',
    status: 'draft',
    metaTitle: body.metaTitle || title,
    metaDescription: body.metaDescription || '',
    heroImageUrl: body.heroImageUrl || '',
    heroImageAlt: body.heroImageAlt || '',
    shortAnswer: body.shortAnswer || '',
    introSection: body.introSection || '',
    scienceSection: body.scienceSection || '',
    mechanismSection: body.mechanismSection || '',
    judithApproach: body.judithApproach || '',
    whatToExpect: body.whatToExpect || '',
    protocolSection: body.protocolSection || '',
    testimonial: body.testimonial || '',
    faqEntries: body.faqEntries || [],
    citations: body.citations || [],
    relatedServices: body.relatedServices || [],
    relatedFaqs: body.relatedFaqs || [],
    relatedArticles: body.relatedArticles || [],
    relatedResources: body.relatedResources || [],
    authorName: 'Judith Dufour-Savard',
    publishedAt: null,
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ id: slug });
}
