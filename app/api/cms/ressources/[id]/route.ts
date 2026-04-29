import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/** GET /api/cms/ressources/[id] */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getAdminFirestore();
  const doc = await db.collection('ressources').doc(id).get();
  if (!doc.exists) return NextResponse.json({ error: 'Ressource introuvable' }, { status: 404 });
  return NextResponse.json({ id: doc.id, ...doc.data() });
}

/** PUT /api/cms/ressources/[id] */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const db = getAdminFirestore();
  await db.collection('ressources').doc(id).update({
    ...body,
    updatedAt: FieldValue.serverTimestamp(),
  });
  return NextResponse.json({ success: true });
}

/** DELETE /api/cms/ressources/[id] */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getAdminFirestore();
  await db.collection('ressources').doc(id).delete();
  return NextResponse.json({ success: true });
}
