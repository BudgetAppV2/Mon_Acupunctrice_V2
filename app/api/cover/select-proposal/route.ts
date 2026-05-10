import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

const COLLECTION_MAP: Record<string, string> = {
  blog: 'publicBlog',
  faq: 'faqs',
  ressource: 'ressources',
};

/** POST /api/cover/select-proposal — Sélectionne une proposition visuelle */
export async function POST(request: NextRequest) {
  try {
    const { slug, type, proposalId } = await request.json() as {
      slug: string;
      type: string;
      proposalId: string;
    };

    if (!slug || !type || !proposalId) {
      return NextResponse.json({ error: 'slug, type, proposalId requis' }, { status: 400 });
    }

    const collection = COLLECTION_MAP[type];
    if (!collection) {
      return NextResponse.json({ error: 'type invalide' }, { status: 400 });
    }

    const db = getAdminFirestore();
    const docRef = db.collection(collection).doc(slug);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });
    }

    const data = doc.data();
    const proposals = data?.imageProposals || [];
    const selected = proposals.find((p: { proposalId: string }) => p.proposalId === proposalId);

    if (!selected) {
      return NextResponse.json({ error: 'Proposal introuvable' }, { status: 404 });
    }

    await docRef.update({
      selectedImageId: proposalId,
      coverImage: selected.coverUrl,
      storyImage: selected.storyUrl,
    });

    return NextResponse.json({
      success: true,
      selected: { proposalId, coverUrl: selected.coverUrl, storyUrl: selected.storyUrl },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur selection proposal';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
