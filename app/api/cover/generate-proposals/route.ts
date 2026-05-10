import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { generateProposals } from '@/lib/cover-generator/variations';
import type { Pilier, ContentType } from '@/lib/cover-generator/types';

const COLLECTION_MAP: Record<string, string> = {
  blog: 'publicBlog',
  faq: 'faqs',
  ressource: 'ressources',
};

/** POST /api/cover/generate-proposals — Génère N propositions visuelles pour un contenu */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      slug: string;
      type: string;
      titre: string;
      pilier?: string;
      count?: number;
      startIndex?: number;
      excludeBgs?: string[];
      excludeLas?: string[];
    };

    const { slug, type, titre } = body;
    if (!slug || !type || !titre) {
      return NextResponse.json({ error: 'slug, type, titre requis' }, { status: 400 });
    }

    const collection = COLLECTION_MAP[type];
    if (!collection) {
      return NextResponse.json({ error: 'type invalide' }, { status: 400 });
    }

    const pilier = (body.pilier || 'transversal') as Pilier;
    const count = body.count || 4;
    const startIndex = body.startIndex || 1;
    const excludeBgs = body.excludeBgs || [];
    const excludeLas = body.excludeLas || [];

    const db = getAdminFirestore();
    const docRef = db.collection(collection).doc(slug);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });
    }

    // Idempotent: skip si proposals déjà complètes et pas de startIndex custom
    const data = doc.data()!;
    if (startIndex === 1 && data.imageProposals?.length >= count) {
      return NextResponse.json({ success: true, proposals: data.imageProposals, cached: true });
    }

    const { successes, failures } = await generateProposals(
      slug,
      type as ContentType,
      titre,
      pilier,
      count,
      startIndex,
      excludeBgs,
      excludeLas,
    );

    // Merge avec proposals existantes si startIndex > 1
    let allProposals = successes;
    if (startIndex > 1 && data?.imageProposals?.length > 0) {
      allProposals = [...data.imageProposals, ...successes];
    }

    await docRef.update({
      imageProposals: allProposals,
      ...(startIndex === 1 ? { regenerationCount: data?.regenerationCount || 0 } : {}),
    });

    return NextResponse.json({ success: true, proposals: allProposals, failures });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur generation proposals';
    console.error('[generate-proposals]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
