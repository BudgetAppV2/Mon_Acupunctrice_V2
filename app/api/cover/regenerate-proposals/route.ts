import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import { generateProposals } from '@/lib/cover-generator/variations';
import type { Pilier, ContentType } from '@/lib/cover-generator/types';

const COLLECTION_MAP: Record<string, string> = {
  blog: 'publicBlog',
  faq: 'faqs',
  ressource: 'ressources',
};

function extractStoragePath(url: string): string {
  // URL format: https://storage.googleapis.com/<bucket>/<path>
  const match = url.match(/storage\.googleapis\.com\/[^/]+\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : '';
}

/** POST /api/cover/regenerate-proposals — Régénère les propositions (max 2 fois) */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      slug: string;
      type: string;
      titre: string;
      pilier?: string;
      mode: 'all' | 'one';
      proposalId?: string;
    };

    const { slug, type, titre, mode } = body;
    if (!slug || !type || !titre || !mode) {
      return NextResponse.json({ error: 'slug, type, titre, mode requis' }, { status: 400 });
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

    const data = doc.data()!;
    const currentCount = data.regenerationCount || 0;

    if (currentCount >= 2) {
      return NextResponse.json(
        { error: 'Limite de regeneration atteinte (max 2)' },
        { status: 429 },
      );
    }

    const pilier = (body.pilier || data.pilier || 'transversal') as Pilier;
    const oldProposals = data.imageProposals || [];
    const bucket = getStorage().bucket();

    if (mode === 'all') {
      // Supprimer toutes les anciennes images de Storage
      await Promise.all(
        oldProposals.flatMap((p: { coverUrl: string; storyUrl: string }) => [
          bucket.file(extractStoragePath(p.coverUrl)).delete().catch(() => {}),
          bucket.file(extractStoragePath(p.storyUrl)).delete().catch(() => {}),
        ]),
      );

      // Régénérer 4 nouvelles
      const { successes, failures } = await generateProposals(
        slug,
        type as ContentType,
        titre,
        pilier,
        4,
        1,
      );

      await docRef.update({
        imageProposals: successes,
        regenerationCount: currentCount + 1,
        selectedImageId: null,
        coverImage: '',
        storyImage: '',
      });

      return NextResponse.json({
        success: true,
        regenerationCount: currentCount + 1,
        proposals: successes,
        failures,
      });
    }

    // mode === 'one'
    if (!body.proposalId) {
      return NextResponse.json({ error: 'proposalId requis pour mode one' }, { status: 400 });
    }

    const targetProposal = oldProposals.find(
      (p: { proposalId: string }) => p.proposalId === body.proposalId,
    );

    if (targetProposal) {
      await Promise.all([
        bucket.file(extractStoragePath(targetProposal.coverUrl)).delete().catch(() => {}),
        bucket.file(extractStoragePath(targetProposal.storyUrl)).delete().catch(() => {}),
      ]);
    }

    // Exclude combos des proposals restantes
    const remaining = oldProposals.filter(
      (p: { proposalId: string }) => p.proposalId !== body.proposalId,
    );
    const excludeBgs = remaining.map((p: { combo: { backgroundFile: string } }) => p.combo.backgroundFile);
    const excludeLas = remaining.map((p: { combo: { lineartFile: string } }) => p.combo.lineartFile);

    const { successes } = await generateProposals(
      slug,
      type as ContentType,
      titre,
      pilier,
      1,
      parseInt(body.proposalId.replace('p', ''), 10),
      excludeBgs,
      excludeLas,
    );

    const updatedProposals = [...remaining, ...successes];
    await docRef.update({ imageProposals: updatedProposals });

    return NextResponse.json({
      success: true,
      regenerationCount: currentCount,
      proposals: updatedProposals,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur regeneration';
    console.error('[regenerate-proposals]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
