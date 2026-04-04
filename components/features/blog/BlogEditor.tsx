'use client';

import { useState, useRef } from 'react';
import { ArrowLeftIcon, EyeIcon, PencilIcon, SparklesIcon, PhotoIcon, ArrowTopRightOnSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseStorage } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store/useAuthStore';

const RDV_URL = 'https://gorendezvous.com/lasourceensoi';

const CATEGORIES = [
  'Acupuncture', 'Fertilite', 'Grossesse', 'Bien-etre',
  'Medecine chinoise', 'Conseils sante', 'Autre',
];

interface FaqItem { question: string; answer: string }

export interface BlogArticle {
  title: string;
  content: string;
  category: string;
  ctaUrl: string;
  faqs?: FaqItem[];
  coverImageUrl?: string;
}

interface Props {
  onPublish: (article: BlogArticle) => void;
  onCancel: () => void;
  publishing?: boolean;
}

async function resizeAndUpload(file: File, uid: string): Promise<string> {
  const img = await createImageBitmap(file);
  const maxW = 1200;
  const scale = img.width > maxW ? maxW / img.width : 1;
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
  const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.85));
  const storage = getFirebaseStorage();
  const path = `blog-covers/${uid}/${Date.now()}.jpg`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

export default function BlogEditor({ onPublish, onCancel, publishing }: Props) {
  const uid = useAuthStore((s) => s.user?.uid);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Acupuncture');
  const [ctaUrl] = useState(RDV_URL);
  const [preview, setPreview] = useState(false);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const canPublish = title.trim().length > 0 && content.trim().length > 0;

  const generateFaq = async () => {
    if (!title.trim()) return;
    setFaqLoading(true);
    try {
      const res = await fetch('/api/generate-blog-faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      if (res.ok) {
        const data = await res.json() as { faqs?: FaqItem[] };
        if (data.faqs?.length) setFaqs(data.faqs);
      }
    } catch { /* failed */ }
    finally { setFaqLoading(false); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uid) return;
    setUploading(true);
    try {
      const url = await resizeAndUpload(file, uid);
      setCoverImageUrl(url);
    } catch { /* upload failed */ }
    finally { setUploading(false); }
  };

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
          <div className="bg-white rounded-xl p-4 space-y-3">
            {coverImageUrl && <img src={coverImageUrl} alt="" className="w-full rounded-lg object-cover" style={{ aspectRatio: '16/9' }} />}
            <span className="text-[10px] font-medium text-sage bg-sage/10 px-2 py-0.5 rounded-full">{category}</span>
            <h2 className="text-lg font-bold text-gray-900">{title || 'Sans titre'}</h2>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</div>
            {faqs.length > 0 && (
              <div className="border-t border-gray-100 pt-3 space-y-3">
                <h3 className="text-sm font-bold text-gray-900">Questions frequentes</h3>
                {faqs.map((faq, i) => (
                  <div key={i}>
                    <p className="text-sm font-semibold text-gray-800">{faq.question}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{faq.answer}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm text-sage font-medium">Prendre rendez-vous :</p>
              <p className="text-sm text-sage underline">{ctaUrl}</p>
            </div>
          </div>
        ) : (
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

            {/* Cover image */}
            <div>
              <label className="text-xs text-gray-500 font-medium">Image de couverture</label>
              {coverImageUrl ? (
                <div className="relative mt-1">
                  <img src={coverImageUrl} alt="" className="w-full rounded-xl object-cover" style={{ aspectRatio: '16/9' }} />
                  <button onClick={() => setCoverImageUrl(undefined)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/50 active:bg-black/70">
                    <XMarkIcon className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <div className="mt-1 space-y-2">
                  <div className="flex gap-2">
                    <button onClick={() => fileRef.current?.click()} disabled={uploading}
                      className="flex-1 flex items-center justify-center gap-1.5 py-3 border border-gray-200 rounded-xl text-xs text-gray-600 active:bg-gray-50">
                      <PhotoIcon className="w-4 h-4" /> {uploading ? 'Upload...' : 'Importer'}
                    </button>
                    <button onClick={() => window.open('https://www.canva.com/create/instagram-stories', '_blank')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-3 border border-gray-200 rounded-xl text-xs text-gray-600 active:bg-gray-50">
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" /> Creer dans Canva
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 text-center">Cree ton design dans Canva, telecharge-le, puis importe-le ici</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium">Contenu</label>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder="Ecris ton article ici...&#10;&#10;Utilise # pour les titres de section&#10;Utilise - pour les listes"
                rows={12}
                className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 leading-relaxed focus:outline-none focus:ring-1 focus:ring-sage resize-none" />
            </div>

            {/* FAQ */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500 font-medium">FAQ SEO (3 questions)</label>
                <button onClick={generateFaq} disabled={faqLoading || !title.trim()}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition ${
                    faqLoading ? 'text-gray-400' : 'text-sage bg-sage/10 active:bg-sage/20'
                  }`}>
                  <SparklesIcon className="w-3.5 h-3.5" />
                  {faqLoading ? 'Generation...' : faqs.length > 0 ? 'Regenerer' : 'Generer FAQ'}
                </button>
              </div>
              {faqs.length > 0 ? (
                <div className="space-y-2">
                  {faqs.map((faq, i) => (
                    <div key={i} className="space-y-1">
                      <input value={faq.question}
                        onChange={e => setFaqs(f => f.map((q, j) => j === i ? { ...q, question: e.target.value } : q))}
                        className="w-full text-xs font-semibold text-gray-800 bg-gray-50 rounded px-2 py-1.5 focus:outline-none" />
                      <textarea value={faq.answer} rows={2}
                        onChange={e => setFaqs(f => f.map((q, j) => j === i ? { ...q, answer: e.target.value } : q))}
                        className="w-full text-xs text-gray-600 bg-gray-50 rounded px-2 py-1.5 resize-none focus:outline-none" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-gray-400">Clique "Generer FAQ" pour creer 3 questions SEO</p>
              )}
            </div>

            <div className="bg-sage/5 border border-sage/20 rounded-xl px-3 py-2.5">
              <label className="text-[10px] text-sage font-semibold uppercase tracking-wider">CTA rendez-vous (ajoute en fin d'article)</label>
              <p className="text-sm text-sage mt-1">Prendre rendez-vous : {ctaUrl}</p>
            </div>
          </>
        )}

        <button onClick={() => onPublish({ title, content, category, ctaUrl, faqs: faqs.length > 0 ? faqs : undefined, coverImageUrl })}
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
