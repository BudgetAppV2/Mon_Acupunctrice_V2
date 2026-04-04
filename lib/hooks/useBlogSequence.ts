'use client';

import { useState } from 'react';
import { collection, doc, writeBatch, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseFirestore, getFirebaseStorage } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { generateStoryImage } from '@/lib/utils/storyImageGenerator';

interface OgData { title: string; imageUrl: string; description: string }

// 4 slots de la séquence : J+0, J+1, J+3, J+7
const SEQUENCE_SLOTS = [
  { offsetDays: 0, format: 'story' as const, role: 'story_promo', autoPublish: true,  promptTitle: '' },
  { offsetDays: 1, format: 'reel'  as const, role: 'reel_resume', autoPublish: false, promptTitle: "Résume l'article en 30-60 sec" },
  { offsetDays: 3, format: 'reel'  as const, role: 'reel_pratique', autoPublish: false, promptTitle: 'UN conseil concret de l\'article' },
  { offsetDays: 7, format: 'story' as const, role: 'story_rappel', autoPublish: true,  promptTitle: '' },
];

export function useBlogSequence() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function scrapeOg(url: string): Promise<OgData> {
    const res = await fetch(`/api/scrape-og?url=${encodeURIComponent(url)}`);
    if (!res.ok) return { title: '', imageUrl: '', description: '' };
    return res.json() as Promise<OgData>;
  }

  async function uploadStoryImage(blob: Blob, type: 'promo' | 'rappel'): Promise<string> {
    const storage = getFirebaseStorage();
    const path = `stories/${user!.uid}/${Date.now()}_${type}.jpg`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  }

  async function createSequence(
    blogUrl: string,
    blogTitle: string,
    startDate: Date,
    blogImageUrl?: string,
  ): Promise<void> {
    if (!user) throw new Error('Non authentifié');
    setLoading(true);
    setError(null);
    try {
      // Pré-générer les deux images story côté client
      const [promoBlob, rappelBlob] = await Promise.all([
        generateStoryImage(blogTitle, 'promo', blogImageUrl),
        generateStoryImage(blogTitle, 'rappel', blogImageUrl),
      ]);
      const [promoUrl, rappelUrl] = await Promise.all([
        uploadStoryImage(promoBlob, 'promo'),
        uploadStoryImage(rappelBlob, 'rappel'),
      ]);

      const db = getFirebaseFirestore();
      const batch = writeBatch(db);
      const slotIds: string[] = [];
      const now = serverTimestamp();

      SEQUENCE_SLOTS.forEach((def, idx) => {
        const slotDate = new Date(startDate);
        slotDate.setDate(slotDate.getDate() + def.offsetDays);
        const slotRef = doc(collection(db, 'calendarSlots'));
        slotIds.push(slotRef.id);

        const storyImageUrl =
          def.role === 'story_promo' ? promoUrl :
          def.role === 'story_rappel' ? rappelUrl :
          undefined;

        batch.set(slotRef, {
          userId: user.uid,
          scheduledDate: Timestamp.fromDate(slotDate),
          dayOfWeek: slotDate.getDay(),
          contentStyle: 'enseigner',
          format: def.format,
          status: 'open',
          sequenceRole: def.role,
          sequencePosition: idx + 1,
          sequenceLength: SEQUENCE_SLOTS.length,
          autoPublish: def.autoPublish,
          ...(storyImageUrl ? { storyImageUrl } : {}),
          ...(def.promptTitle ? { promptTitle: def.promptTitle } : {}),
          weekNumber: Math.ceil(slotDate.getDate() / 7),
          planPhase: 1,
          createdAt: now,
          updatedAt: now,
        });
      });

      // Créer le doc BlogSequence avec les slotIds connus
      const seqRef = doc(collection(db, 'blogSequences'));
      batch.set(seqRef, {
        userId: user.uid,
        blogUrl,
        blogTitle,
        ...(blogImageUrl ? { blogImageUrl } : {}),
        storyImageUrl: promoUrl,
        startDate: Timestamp.fromDate(startDate),
        status: 'active',
        slotIds,
        createdAt: now,
        updatedAt: now,
      });

      await batch.commit();

      // Background: generate captions for the 2 reel slots (non-blocking)
      const reelSlots = SEQUENCE_SLOTS
        .map((def, idx) => ({ def, slotId: slotIds[idx] }))
        .filter(s => s.def.role === 'reel_resume' || s.def.role === 'reel_pratique');
      for (const { def, slotId } of reelSlots) {
        fetch('/api/generate-blog-captions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blogTitle, blogUrl, role: def.role }),
        })
          .then(r => r.ok ? r.json() : null)
          .then(captions => {
            if (captions && (captions.instagram || captions.facebook || captions.youtube)) {
              updateDoc(doc(db, 'calendarSlots', slotId), { generatedCaptions: captions });
            }
          })
          .catch(() => { /* caption generation failed — non-blocking */ });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { scrapeOg, createSequence, loading, error };
}
