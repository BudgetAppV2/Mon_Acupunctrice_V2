import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import { FieldValue } from 'firebase-admin/firestore';

const COLLECTION_MAP: Record<string, string> = {
  blog: 'publicBlog',
  faq: 'faqs',
  ressource: 'ressources',
};

function extractStoragePath(url: string): string {
  const match = url.match(/storage\.googleapis\.com\/[^/]+\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : '';
}

/** POST /api/cms/approve — Approuve un contenu (status → published + revalidate ISR) */
export async function POST(request: NextRequest) {
  const { id, type, uid } = await request.json() as { id: string; type: string; uid: string };
  if (!id || !type) return NextResponse.json({ error: 'id et type requis' }, { status: 400 });

  const collection = COLLECTION_MAP[type];
  if (!collection) return NextResponse.json({ error: 'type invalide' }, { status: 400 });

  const db = getAdminFirestore();
  const docRef = db.collection(collection).doc(id);

  // Read current data for M2A cleanup
  const doc = await docRef.get();
  const data = doc.data();

  await docRef.update({
    status: 'published',
    publishedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    reviewedAt: FieldValue.serverTimestamp(),
    reviewedBy: uid || '',
  });

  // M2A: cleanup non-selected proposals from Firebase Storage
  if (data && data.imageProposals?.length > 0 && data.selectedImageId) {
    try {
      const bucket = getStorage().bucket();
      const toDelete = data.imageProposals.filter(
        (p: { proposalId: string }) => p.proposalId !== data.selectedImageId,
      );
      await Promise.all(
        toDelete.flatMap((p: { coverUrl: string; storyUrl: string }) => [
          bucket.file(extractStoragePath(p.coverUrl)).delete().catch(() => {}),
          bucket.file(extractStoragePath(p.storyUrl)).delete().catch(() => {}),
        ]),
      );
      // Keep only the selected proposal in Firestore
      await docRef.update({
        imageProposals: data.imageProposals.filter(
          (p: { proposalId: string }) => p.proposalId === data.selectedImageId,
        ),
      });
    } catch (err) {
      console.error('[approve] Cleanup proposals failed:', err);
    }
  }

  // Revalidate ISR
  if (type === 'blog') {
    revalidatePath('/blog');
    revalidatePath(`/blog/${id}`);
  } else if (type === 'faq') {
    revalidatePath('/faq');
  } else if (type === 'ressource') {
    revalidatePath('/ressources');
    revalidatePath(`/ressources/${id}`);
  }

  return NextResponse.json({ success: true });
}
