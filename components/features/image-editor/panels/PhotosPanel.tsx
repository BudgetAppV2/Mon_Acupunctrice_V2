'use client';

import { useState, useCallback, useRef } from 'react';
import type { Canvas } from 'fabric';
import { FabricImage } from 'fabric';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

/* Limite : 50 req/heure sur le plan gratuit Unsplash */
const UNSPLASH_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

interface UnsplashPhoto {
  id: string;
  urls: { small: string; regular: string };
  alt_description: string | null;
}

interface Props { canvas: Canvas | null }

export default function PhotosPanel({ canvas }: Props) {
  const [query, setQuery] = useState('');
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim() || !UNSPLASH_KEY) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=12&orientation=portrait`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } },
      );
      const data = await res.json();
      setPhotos(data.results ?? []);
    } catch { setPhotos([]); }
    setLoading(false);
  }, []);

  const handleInput = (val: string) => {
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 300);
  };

  const addPhoto = async (url: string) => {
    if (!canvas) return;
    try {
      const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
      img.scaleToWidth(500);
      img.set({ left: 290, top: 460, selectable: true, evented: true });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    } catch { /* image load failed — CORS or network */ }
  };

  if (!UNSPLASH_KEY) {
    return (
      <div>
        <h3 className="text-xs font-semibold text-white/60 uppercase mb-3">Photos</h3>
        <p className="text-xs text-white/40 leading-relaxed">
          Configurez la variable NEXT_PUBLIC_UNSPLASH_ACCESS_KEY dans .env.local
          pour activer la recherche de photos Unsplash.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-white/60 uppercase mb-3">Photos</h3>
      <div className="relative mb-3">
        <MagnifyingGlassIcon className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Rechercher sur Unsplash..."
          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-teal-400"
        />
      </div>
      {loading && <p className="text-xs text-white/40">Chargement...</p>}
      <div className="grid grid-cols-2 gap-2">
        {photos.map((p) => (
          <button
            key={p.id}
            onClick={() => addPhoto(p.urls.regular)}
            className="rounded-lg overflow-hidden hover:ring-2 ring-teal-400 transition-all"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.urls.small} alt={p.alt_description ?? 'photo'} className="w-full aspect-[3/4] object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
