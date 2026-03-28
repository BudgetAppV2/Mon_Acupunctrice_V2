'use client';

import { useState, useCallback } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useUpdateContentItem } from './useUpdateContentItem';
import { useProgression } from './useProgression';

interface PublishOptions {
  videoUrl: string;
  caption: string;
  captions?: { instagram: string; facebook: string; youtube: string };
  itemId: string;
  uid: string;
  coverOption: 'frame' | 'custom';
  thumbOffset?: number;
  coverUrl?: string;
}

/** Hook pour publier sur Instagram ou planifier une publication */
export function usePublish() {
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateItem } = useUpdateContentItem();
  const { updateProgression } = useProgression();

  const publish = useCallback(async (opts: PublishOptions) => {
    setPublishing(true);
    setError(null);
    console.log('[PUBLISH] Starting publish for', opts.itemId);
    console.log('[PUBLISH] Options:', JSON.stringify({ videoUrl: opts.videoUrl?.substring(0, 80) + '...', caption: opts.caption?.substring(0, 50), coverOption: opts.coverOption, thumbOffset: opts.thumbOffset }));
    try {
      await updateItem(opts.itemId, {
        distributionStatus: 'publishing',
        caption: opts.caption,
        ...(opts.captions ? { captions: opts.captions } : {}),
        coverOption: opts.coverOption,
        thumbOffset: opts.thumbOffset ?? null,
        coverImageUrl: opts.coverUrl ?? null,
      });

      const res = await fetch('/api/publish-instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: opts.itemId, uid: opts.uid }),
      });
      console.log('[PUBLISH] API response status:', res.status);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('[PUBLISH] API error:', errData);
        throw new Error(errData.error || 'Publication échouée');
      }

      const data = await res.json();
      console.log('[PUBLISH] Success! mediaId:', data.mediaId);
      await updateProgression();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de publication';
      console.error('[PUBLISH] FAILED:', msg);
      setError(msg);
      await updateItem(opts.itemId, { distributionStatus: 'failed' }).catch(() => {});
      return false;
    } finally {
      setPublishing(false);
    }
  }, [updateItem]);

  const schedule = useCallback(async (
    itemId: string, caption: string, date: Date,
    coverOption: 'frame' | 'custom', thumbOffset?: number, coverUrl?: string,
  ) => {
    try {
      await updateItem(itemId, {
        distributionStatus: 'scheduled',
        scheduledAt: Timestamp.fromDate(date),
        caption,
        coverOption,
        thumbOffset: thumbOffset ?? null,
        coverImageUrl: coverUrl ?? null,
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de planification');
      return false;
    }
  }, [updateItem]);

  return { publish, schedule, publishing, error };
}
