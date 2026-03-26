'use client';

import { useState } from 'react';
import type { ContentItem } from '@/lib/types';

interface Options {
  item: ContentItem;
  uid: string | undefined;
  caption: string;
  captions?: { instagram: string; facebook: string; youtube: string };
  coverOption: 'frame' | 'custom';
  thumbOffset?: number;
  coverUrl?: string;
  publish: (opts: {
    videoUrl: string; caption: string; captions?: { instagram: string; facebook: string; youtube: string }; itemId: string;
    coverOption: 'frame' | 'custom'; thumbOffset?: number; coverUrl?: string;
  }) => Promise<boolean>;
  uploadFrameAsCover: () => Promise<string | undefined>;
  setDone: (v: boolean) => void;
}

/** Orchestre la publication parallele Facebook + YouTube */
export function useMultiPlatformPublish({
  item, uid, caption, captions, coverOption, thumbOffset, coverUrl, publish, uploadFrameAsCover, setDone,
}: Options) {
  const [alsoFacebook, setAlsoFacebook] = useState(false);
  const [alsoYoutube, setAlsoYoutube] = useState(false);
  const [fbError, setFbError] = useState<string | null>(null);
  const [ytError, setYtError] = useState<string | null>(null);

  const publishToApi = async (api: string, label: string, setErr: (e: string) => void) => {
    try {
      const r = await fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itemId: item.id, uid }) });
      if (!r.ok) { const d = await r.json().catch(() => ({})); setErr(`${label} : ${d.error || 'connexion expiree. Reconnecte dans Profil.'}`); }
    } catch { setErr(`${label} : erreur de connexion`); }
  };

  const handlePublish = async () => {
    if (!item.videoUrl) return;
    setFbError(null); setYtError(null);
    const finalCoverUrl = coverUrl || await uploadFrameAsCover();
    const ok = await publish({ videoUrl: item.videoUrl, caption, captions, itemId: item.id, coverOption, thumbOffset, coverUrl: finalCoverUrl });
    if (ok && uid) {
      const tasks: Promise<void>[] = [];
      if (alsoFacebook) tasks.push(publishToApi('/api/publish-facebook', 'Facebook', setFbError));
      if (alsoYoutube) tasks.push(publishToApi('/api/publish-youtube', 'YouTube', setYtError));
      await Promise.allSettled(tasks);
    }
    if (ok) setDone(true);
  };

  return {
    handlePublish,
    alsoFacebook, setAlsoFacebook,
    alsoYoutube, setAlsoYoutube,
    fbError, ytError,
  };
}
