'use client';

import { useState } from 'react';
import type { ContentItem } from '@/lib/types';

interface Options {
  item: ContentItem;
  uid: string | undefined;
  caption: string;
  coverOption: 'frame' | 'custom';
  thumbOffset?: number;
  coverUrl?: string;
  publish: (opts: {
    videoUrl: string; caption: string; itemId: string;
    coverOption: 'frame' | 'custom'; thumbOffset?: number; coverUrl?: string;
  }) => Promise<boolean>;
  uploadFrameAsCover: () => Promise<string | undefined>;
  setDone: (v: boolean) => void;
}

/**
 * Gère les toggles multi-plateforme et orchestre la publication parallèle.
 * Extrait de PublishSheet pour respecter la limite de 150 lignes.
 */
export function useMultiPlatformPublish({
  item, uid, caption, coverOption, thumbOffset, coverUrl, publish, uploadFrameAsCover, setDone,
}: Options) {
  const [alsoFacebook, setAlsoFacebook] = useState(false);
  const [alsoYoutube, setAlsoYoutube] = useState(false);
  const [alsoStory, setAlsoStory] = useState(false);
  const [fbError, setFbError] = useState<string | null>(null);
  const [ytError, setYtError] = useState<string | null>(null);
  const [storyError, setStoryError] = useState<string | null>(null);

  const publishToApi = async (api: string, setErr: (e: string) => void) => {
    try {
      const r = await fetch(api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id, uid }),
      });
      if (!r.ok) { const d = await r.json().catch(() => ({})); setErr(d.error || 'Erreur'); }
    } catch { setErr('Erreur'); }
  };

  const handlePublish = async () => {
    if (!item.videoUrl) return;
    setFbError(null); setYtError(null); setStoryError(null);
    const finalCoverUrl = coverUrl || await uploadFrameAsCover();
    const ok = await publish({ videoUrl: item.videoUrl, caption, itemId: item.id, coverOption, thumbOffset, coverUrl: finalCoverUrl });
    if (ok && uid) {
      const tasks: Promise<void>[] = [];
      if (alsoFacebook) tasks.push(publishToApi('/api/publish-facebook', setFbError));
      if (alsoYoutube) tasks.push(publishToApi('/api/publish-youtube', setYtError));
      if (alsoStory) tasks.push(publishToApi('/api/publish-story', setStoryError));
      await Promise.allSettled(tasks);
    }
    if (ok) setDone(true);
  };

  return {
    handlePublish,
    alsoFacebook, setAlsoFacebook,
    alsoYoutube, setAlsoYoutube,
    alsoStory, setAlsoStory,
    fbError, ytError, storyError,
  };
}
