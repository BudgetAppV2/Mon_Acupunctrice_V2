'use client';

import { useState } from 'react';
import BottomSheet from '@/components/ui/BottomSheet';
import { useBlogSequence } from '@/lib/hooks/useBlogSequence';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Labels lisibles pour chaque rôle de la séquence
const ROLE_LABELS: Record<string, string> = {
  story_promo:   'Story promo — Lien dans ma bio',
  reel_resume:   'Reel — Résumé de l\'article (30-60 sec)',
  reel_pratique: 'Reel — UN conseil concret de l\'article',
  story_rappel:  'Story rappel — Tu as manqué cet article?',
};

const OFFSETS = [0, 1, 3, 7];
const ROLES = ['story_promo', 'reel_resume', 'reel_pratique', 'story_rappel'];

function addDays(date: Date, n: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('fr-CA', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function CreateSequenceSheet({ isOpen, onClose }: Props) {
  const { scrapeOg, createSequence, loading, error } = useBlogSequence();

  const [url, setUrl] = useState('');
  const [ogData, setOgData] = useState<{ title: string; imageUrl: string } | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [done, setDone] = useState(false);

  const startDate = new Date(); // Aujourd'hui

  const handleAnalyse = async () => {
    if (!url.trim()) return;
    setAnalysing(true);
    const data = await scrapeOg(url.trim());
    setOgData(data);
    setAnalysing(false);
  };

  const handleCreate = async () => {
    if (!ogData) return;
    await createSequence(url.trim(), ogData.title || url, startDate, ogData.imageUrl);
    setDone(true);
    setTimeout(() => {
      setUrl('');
      setOgData(null);
      setDone(false);
      onClose();
    }, 1200);
  };

  const handleClose = () => {
    setUrl('');
    setOgData(null);
    setDone(false);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Nouvelle séquence blogue">
      <div className="px-4 pb-6 space-y-4">

        {/* Étape 1 : URL */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Lien de l'article
          </label>
          <div className="flex gap-2 mt-1">
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setOgData(null); }}
              placeholder="https://mon-acupunctrice.ca/article/..."
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage/40"
            />
            <button
              onClick={handleAnalyse}
              disabled={!url.trim() || analysing}
              className="p-2 bg-sage text-white rounded-lg disabled:opacity-40"
              aria-label="Analyser l'article"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Étape 2 : Aperçu OG */}
        {ogData && (
          <div className="border border-gray-100 rounded-xl p-3 flex gap-3 items-start">
            {ogData.imageUrl && (
              <img
                src={ogData.imageUrl}
                alt=""
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <p className="text-sm font-medium text-gray-900 leading-snug">
              {ogData.title || url}
            </p>
          </div>
        )}

        {/* Étape 3 : Aperçu de la séquence */}
        {ogData && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Séquence générée (4 contenus)
            </p>
            <ul className="space-y-1.5">
              {ROLES.map((role, idx) => (
                <li key={role} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-5 h-5 flex-shrink-0 rounded-full bg-sage/20 text-sage text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-gray-400 text-xs w-16 flex-shrink-0">
                    {addDays(startDate, OFFSETS[idx])}
                  </span>
                  <span className="text-xs">{ROLE_LABELS[role]}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Erreur */}
        {error && <p className="text-xs text-red-500">{error}</p>}

        {/* Bouton créer */}
        {ogData && !done && (
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-3 bg-sage text-white text-sm font-semibold rounded-xl disabled:opacity-40"
          >
            {loading ? 'Création en cours…' : 'Créer la séquence'}
          </button>
        )}

        {done && (
          <p className="text-center text-sm text-sage font-semibold">Séquence créée!</p>
        )}
      </div>
    </BottomSheet>
  );
}
