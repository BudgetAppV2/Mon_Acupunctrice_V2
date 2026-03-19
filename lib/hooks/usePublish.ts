'use client';

import { useState, useCallback } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useUpdateContentItem } from './useUpdateContentItem';

interface PublishOptions {
  videoUrl: string;
  caption: string;
  itemId: string;
  coverOption: 'frame' | 'custom';
  thumbOffset?: number;
  coverUrl?: string;
}

/** Hook pour publier sur Instagram ou planifier une publication */
export function usePublish() {
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateItem } = useUpdateContentItem();

  const publish = useCallback(async (opts: PublishOptions) => {
    setPublishing(true);
    setError(null);
    try {
      await updateItem(opts.itemId, { distributionStatus: 'publishing' });

      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opts),
      });
      if (!res.ok) throw new Error('Publication échouée');

      const data = await res.json();
      await updateItem(opts.itemId, {
        distributionStatus: 'published',
        instagramPostId: data.mediaId,
        caption: opts.caption,
        coverOption: opts.coverOption,
        thumbOffset: opts.thumbOffset ?? null,
        coverImageUrl: opts.coverUrl ?? null,
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de publication');
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
