'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeftIcon, EyeIcon, PencilIcon, SparklesIcon, PhotoIcon, ArrowTopRightOnSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseStorage } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { htmlToMarkdownText } from '@/lib/utils/ricosConverter';

const TiptapEditor = dynamic(() => import('./TiptapEditor'), { ssr: false });

import { getRdvUrl } from '@/lib/utils/rdvUrl';

const RDV_URL = getRdvUrl({ source: 'blog', medium: 'article' });
const CATEGORIES = ['Acupuncture', 'Fertilite', 'Grossesse', 'Bien-etre', 'Medecine chinoise', 'Conseils sante', 'Autre'];
const DRAFT_KEY = 'blog-editor-draft';
const EXPORT_KEY = 'editor-export-blog';

interface FaqItem { question: string; answer: string }

export interface BlogArticle {
  title: string;
  content: string;
  category: string;
  ctaUrl: string;
  faqs?: FaqItem[];
  coverImageUrl?: string;
  storyImageUrl?: string;
}

interface Props { onPublish: (article: BlogArticle) => void; onCancel: () => void; publishing?: boolean }

async function resizeAndUpload(file: File, uid: string): Promise<string> {
  const img = await createImageBitmap(file);
  const maxW = 1200;
  const scale = img.width > maxW ? maxW / img.width : 1;
  const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
  const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.85));
  const storage = getFirebaseStorage();
  const storageRef = ref(storage, `blog-covers/${uid}/${Date.now()}.jpg`);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}

export default function BlogEditor({ onPublish, onCancel, publishing }: Props) {
  const uid = useAuthStore((s) => s.user?.uid);
  const [title, setTitle] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [category, setCategory] = useState('Acupuncture');
  const [ctaUrl] = useState(RDV_URL);
  const [preview, setPreview] = useState(false);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [faqLoading, setFaqLoading] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>();
  const [storyImageUrl, setStoryImageUrl] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(false);

  const canPublish = title.trim().length > 0 && htmlContent.trim().length > 0;

  // Restore draft + check for editor export on mount
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    // Check if the image editor left exported images
    const exportData = localStorage.getItem(EXPORT_KEY);
    if (exportData) {
      try {
        const data = JSON.parse(exportData) as { coverDataUrl?: string; storyDataUrl?: string };
        if (data.coverDataUrl) setCoverImageUrl(data.coverDataUrl);
        if (data.storyDataUrl) setStoryImageUrl(data.storyDataUrl);
      } catch {
        setCoverImageUrl(exportData);
      }
      localStorage.removeItem(EXPORT_KEY);
    }

    // Restore draft
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.title) setTitle(d.title);
        if (d.htmlContent) setHtmlContent(d.htmlContent);
        if (d.category) setCategory(d.category);
        if (d.faqs?.length) setFaqs(d.faqs);
        // Only restore images from draft if we didn't just get them from editor export
        if (!exportData) {
          if (d.coverImageUrl) setCoverImageUrl(d.coverImageUrl);
          if (d.storyImageUrl) setStoryImageUrl(d.storyImageUrl);
        }
      } catch { /* corrupt draft */ }
    }
  }, []);

  // Auto-save draft on every change
  const saveDraft = useCallback(() => {
    const draft = { title, htmlContent, category, faqs, coverImageUrl, storyImageUrl };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [title, htmlContent, category, faqs, coverImageUrl, storyImageUrl]);

  useEffect(() => { saveDraft(); }, [saveDraft]);

  // Listen for image export while editor is open (StorageEvent from another tab)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== EXPORT_KEY || !e.newValue) return;
      try {
        const data = JSON.parse(e.newValue) as { coverDataUrl?: string; storyDataUrl?: string };
        if (data.coverDataUrl) setCoverImageUrl(data.coverDataUrl);
        if (data.storyDataUrl) setStoryImageUrl(data.storyDataUrl);
      } catch {
        setCoverImageUrl(e.newValue);
      }
      localStorage.removeItem(EXPORT_KEY);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const generateFaq = async () => {
    if (!title.trim()) return;
    setFaqLoading(true);
    try {
      const text = htmlToMarkdownText(htmlContent);
      const res = await fetch('/api/generate-blog-faq', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content: text }) });
      if (res.ok) { const data = await res.json() as { faqs?: FaqItem[] }; if (data.faqs?.length) setFaqs(data.faqs); }
    } catch {} finally { setFaqLoading(false); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uid) return;
    setUploading(true);
    try { setCoverImageUrl(await resizeAndUpload(file, uid)); } catch {} finally { setUploading(false); }
  };

  const handlePublish = async () => {
    if (!uid) return;
    const content = htmlToMarkdownText(htmlContent);

    let uploadedStoryUrl = storyImageUrl;
    if (storyImageUrl?.startsWith('data:')) {
      try {
        const blob = await (await fetch(storyImageUrl)).blob();
        const storage = getFirebaseStorage();
        const sRef = ref(storage, `blog-covers/${uid}/story-${Date.now()}.png`);
        await uploadBytes(sRef, blob);
        uploadedStoryUrl = await getDownloadURL(sRef);
      } catch { /* story upload failed */ }
    }

    let uploadedCoverUrl = coverImageUrl;
    if (coverImageUrl?.startsWith('data:')) {
      try {
        const blob = await (await fetch(coverImageUrl)).blob();
        const storage = getFirebaseStorage();
        const cRef = ref(storage, `blog-covers/${uid}/cover-${Date.now()}.png`);
        await uploadBytes(cRef, blob);
        uploadedCoverUrl = await getDownloadURL(cRef);
      } catch { /* cover upload failed */ }
    }

    // Clear draft after successful publish
    localStorage.removeItem(DRAFT_KEY);

    onPublish({
      title, content, category, ctaUrl,
      faqs: faqs.length > 0 ? faqs : undefined,
      coverImageUrl: uploadedCoverUrl,
      storyImageUrl: uploadedStoryUrl,
    });
  };

  const handleCancel = () => {
    // Keep draft in localStorage so it can be restored later
    onCancel();
  };

  const today = new Date();
  const dateStr = `${today.getDate()} ${['jan','fev','mar','avr','mai','jun','jul','aou','sep','oct','nov','dec'][today.getMonth()]}. ${today.getFullYear()}`;

  return (
    <div className="min-h-screen bg-sand pb-24">
      <header className="px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
        <button onClick={handleCancel} className="p-1"><ArrowLeftIcon className="w-5 h-5 text-gray-600" /></button>
        <h1 className="text-lg font-semibold text-sage flex-1">Nouvel article</h1>
        <button onClick={() => setPreview(!preview)} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-sage bg-sage/10">
          {preview ? <PencilIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
          {preview ? 'Editer' : 'Apercu'}
        </button>
      </header>

      <div className="px-4 pt-4 space-y-4">
        {preview ? (
          <BlogPreview title={title} htmlContent={htmlContent} category={category} coverImageUrl={coverImageUrl} faqs={faqs} ctaUrl={ctaUrl} dateStr={dateStr} />
        ) : (
          <>
            <div>
              <label className="text-xs text-gray-500 font-medium">Titre</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre de l'article..."
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
              <label className="text-xs text-gray-500 font-medium">Image de couverture</label>
              {coverImageUrl ? (
                <div className="relative mt-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverImageUrl} alt="" className="w-full rounded-xl object-cover" style={{ aspectRatio: '16/9' }} />
                  <button onClick={() => { setCoverImageUrl(undefined); setStoryImageUrl(undefined); }} className="absolute top-2 right-2 p-1 rounded-full bg-black/50"><XMarkIcon className="w-4 h-4 text-white" /></button>
                </div>
              ) : (
                <div className="mt-1 space-y-2">
                  <div className="flex gap-2">
                    <button onClick={() => fileRef.current?.click()} disabled={uploading}
                      className="flex-1 flex items-center justify-center gap-1.5 py-3 border border-gray-200 rounded-xl text-xs text-gray-600 active:bg-gray-50">
                      <PhotoIcon className="w-4 h-4" /> {uploading ? 'Upload...' : 'Importer'}
                    </button>
                    <button onClick={() => window.open('/editeur-image?returnTo=blog', '_blank')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-3 border border-sage/30 rounded-xl text-xs text-sage font-medium active:bg-sage/5">
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" /> Creer l&apos;image
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 text-center">Cree ton design — l&apos;image revient automatiquement ici</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Contenu</label>
              <div className="mt-1"><TiptapEditor content={htmlContent} onChange={setHtmlContent} /></div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500 font-medium">FAQ SEO (3 questions)</label>
                <button onClick={generateFaq} disabled={faqLoading || !title.trim()}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition ${faqLoading ? 'text-gray-400' : 'text-sage bg-sage/10 active:bg-sage/20'}`}>
                  <SparklesIcon className="w-3.5 h-3.5" /> {faqLoading ? 'Generation...' : faqs.length > 0 ? 'Regenerer' : 'Generer FAQ'}
                </button>
              </div>
              {faqs.length > 0 ? faqs.map((faq, i) => (
                <div key={i} className="space-y-1">
                  <input value={faq.question} onChange={e => setFaqs(f => f.map((q, j) => j === i ? { ...q, question: e.target.value } : q))}
                    className="w-full text-xs font-semibold text-gray-800 bg-gray-50 rounded px-2 py-1.5 focus:outline-none" />
                  <textarea value={faq.answer} rows={2} onChange={e => setFaqs(f => f.map((q, j) => j === i ? { ...q, answer: e.target.value } : q))}
                    className="w-full text-xs text-gray-600 bg-gray-50 rounded px-2 py-1.5 resize-none focus:outline-none" />
                </div>
              )) : <p className="text-[11px] text-gray-400">Clique &quot;Generer FAQ&quot; pour creer 3 questions SEO</p>}
            </div>
            <div className="bg-sage/5 border border-sage/20 rounded-xl px-3 py-2.5">
              <label className="text-[10px] text-sage font-semibold uppercase tracking-wider">CTA rendez-vous (ajoute en fin d&apos;article)</label>
              <p className="text-sm text-sage mt-1">Prendre rendez-vous : {ctaUrl}</p>
            </div>
          </>
        )}
        <button onClick={handlePublish} disabled={!canPublish || publishing}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition ${canPublish && !publishing ? 'bg-sage text-white active:bg-sage/90' : 'bg-gray-200 text-gray-400'}`}>
          {publishing ? 'Publication en cours...' : 'Publier sur Wix'}
        </button>
      </div>
    </div>
  );
}

function BlogPreview({ title, htmlContent, category, coverImageUrl, faqs, ctaUrl, dateStr }: {
  title: string; htmlContent: string; category: string; coverImageUrl?: string; faqs: { question: string; answer: string }[]; ctaUrl: string; dateStr: string;
}) {
  return (
    <div className="bg-white rounded-xl overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {coverImageUrl && <img src={coverImageUrl} alt="" className="w-full object-cover" style={{ aspectRatio: '16/9' }} />}
      <div className="p-4 space-y-3">
        <span className="text-[10px] font-medium text-sage bg-sage/10 px-2 py-0.5 rounded-full">{category}</span>
        <h2 className="text-lg font-bold text-gray-900">{title || 'Sans titre'}</h2>
        <p className="text-xs text-gray-400">Judith Dufour-Savard · {dateStr}</p>
        <hr className="border-gray-100" />
        <div className="tiptap-content text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: htmlContent }} />
        {faqs.length > 0 && (<>
          <hr className="border-gray-100" />
          <h3 className="text-sm font-bold text-gray-900">Questions frequentes</h3>
          {faqs.map((faq, i) => (<div key={i}><p className="text-sm font-semibold text-gray-800">{faq.question}</p><p className="text-sm text-gray-600 mt-0.5">{faq.answer}</p></div>))}
        </>)}
        <hr className="border-gray-100" />
        <p className="text-sm text-sage font-medium">Prendre rendez-vous :</p>
        <p className="text-sm text-sage underline">{ctaUrl}</p>
      </div>
      <style>{`
        .tiptap-content h2 { font-size: 1.25rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.5rem; }
        .tiptap-content h3 { font-size: 1.1rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; }
        .tiptap-content p { margin-bottom: 0.75rem; }
        .tiptap-content ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
        .tiptap-content li { margin-bottom: 0.25rem; }
        .tiptap-content strong { font-weight: 700; }
        .tiptap-content em { font-style: italic; }
        .tiptap-content u { text-decoration: underline; }
      `}</style>
    </div>
  );
}
