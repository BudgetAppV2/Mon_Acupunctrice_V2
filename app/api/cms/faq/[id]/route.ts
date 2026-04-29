import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/** GET /api/cms/faq/[id] */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getAdminFirestore();
  const doc = await db.collection('faqs').doc(id).get();
  if (!doc.exists) return NextResponse.json({ error: 'FAQ introuvable' }, { status: 404 });
  return NextResponse.json({ id: doc.id, ...doc.data() });
}

/** PUT /api/cms/faq/[id] */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const db = getAdminFirestore();
  await db.collection('faqs').doc(id).update({
    ...body,
    updatedAt: FieldValue.serverTimestamp(),
  });
  return NextResponse.json({ success: true });
}

/** DELETE /api/cms/faq/[id] */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getAdminFirestore();
  await db.collection('faqs').doc(id).delete();
  return NextResponse.json({ success: true });
}
