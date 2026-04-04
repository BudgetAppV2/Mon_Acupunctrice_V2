'use client';

import { useState } from 'react';
import { ArrowLeftIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';

const RDV_URL = 'https://gorendezvous.com/lasourceensoi';

const CATEGORIES = [
  'Acupuncture', 'Fertilite', 'Grossesse', 'Bien-etre',
  'Medecine chinoise', 'Conseils sante', 'Autre',
];

interface BlogArticle {
  title: string;
  content: string;
  category: string;
  ctaUrl: string;
}

interface Props {
  onPublish: (article: BlogArticle) => void;
  onCancel: () => void;
  publishing?: boolean;
}

export default function BlogEditor({ onPublish, onCancel, publishing }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Acupuncture');
  const [ctaUrl] = useState(RDV_URL);
  const [preview, setPreview] = useState(false);

  const canPublish = title.trim().length > 0 && content.trim().length > 0;

  return (
    <div className="min-h-screen bg-sand pb-24">
      <header className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
        <button onClick={onCancel} className="p-1"><ArrowLeftIcon className="w-5 h-5 text-gray-600" /></button>
        <h1 className="text-lg font-semibold text-sage flex-1">Nouvel article</h1>
        <button onClick={() => setPreview(!preview)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-sage bg-sage/10">
          {preview ? <PencilIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
          {preview ? 'Editer' : 'Apercu'}
        </button>
      </header>

      <div className="px-4 pt-4 space-y-4">
        {preview ? (
          /* Preview mode */
          <div className="bg-white rounded-xl p-4 space-y-3">
            <span className="text-[10px] font-medium text-sage bg-sage/10 px-2 py-0.5 rounded-full">{category}</span>
            <h2 className="text-lg font-bold text-gray-900">{title || 'Sans titre'}</h2>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</div>
            <div className="border-t border-gray-100 pt-3 mt-3">
              <p className="text-sm text-sage font-medium">Prendre rendez-vous :</p>
              <p className="text-sm text-sage underline">{ctaUrl}</p>
            </div>
          </div>
        ) : (
          /* Edit mode */
          <>
            <div>
              <label className="text-xs text-gray-500 font-medium">Titre</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Titre de l'article..."
                className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-sage" />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium">Categorie</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium">Contenu</label>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder="Ecris ton article ici...&#10;&#10;Utilise # pour les titres de section&#10;Utilise - pour les listes"
                rows={12}
                className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 leading-relaxed focus:outline-none focus:ring-1 focus:ring-sage resize-none" />
            </div>

            <div className="bg-sage/5 border border-sage/20 rounded-xl px-3 py-2.5">
              <label className="text-[10px] text-sage font-semibold uppercase tracking-wider">CTA rendez-vous (ajoute en fin d'article)</label>
              <p className="text-sm text-sage mt-1">Prendre rendez-vous : {ctaUrl}</p>
            </div>
          </>
        )}

        <button onClick={() => onPublish({ title, content, category, ctaUrl })}
          disabled={!canPublish || publishing}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition ${
            canPublish && !publishing ? 'bg-sage text-white active:bg-sage/90' : 'bg-gray-200 text-gray-400'
          }`}>
          {publishing ? 'Publication en cours...' : 'Publier sur Wix'}
        </button>
      </div>
    </div>
  );
}
