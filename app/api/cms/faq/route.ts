import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/** GET /api/cms/faq — Liste toutes les FAQ */
export async function GET() {
  const db = getAdminFirestore();
  const snap = await db.collection('faqs').orderBy('category').orderBy('order').get();
  const faqs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return NextResponse.json({ faqs });
}

/** POST /api/cms/faq — Cree une nouvelle FAQ */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { question, answer, category, order } = body as {
    question?: string; answer?: string; category?: string; order?: number;
  };
  if (!question || !answer) return NextResponse.json({ error: 'question et answer requis' }, { status: 400 });

  const db = getAdminFirestore();
  const docRef = await db.collection('faqs').add({
    question,
    reponse: answer,
    category: category || 'general',
    order: order ?? 0,
    status: 'draft',
    ctaVariant: 'reserver',
    relatedServices: [],
    relatedArticles: [],
    relatedFaqs: [],
    publishedAt: null,
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ id: docRef.id });
}
