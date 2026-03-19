'use client';

import { useState, useCallback } from 'react';
import type { JamendoTrack } from '@/lib/types';

/** Hook pour rechercher de la musique sur Jamendo via la Cloud Function */
export function useMusicSearch() {
  const [tracks, setTracks] = useState<JamendoTrack[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query?: string, mood?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (mood) params.set('mood', mood);

      const res = await fetch(`/api/search-music?${params}`);
      if (!res.ok) throw new Error('Recherche échouée');
      const data = await res.json();
      setTracks(data.tracks || []);
    } catch {
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { tracks, loading, search };
}
