'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import MarkdownField from '@/components/features/cms/MarkdownField';
import StatusBadge from '@/components/features/cms/StatusBadge';
import type { PublicationStatus } from '@/lib/types/faq';

const CATEGORIES = ['fertilite', 'grossesse', 'pediatrie', 'acupuncture-sociale', 'seance'];

export default function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('seance');
  const [order, setOrder] = useState(0);
  const [status, setStatus] = useState<PublicationStatus>('draft');
  const [reviewComment, setReviewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/cms/faq/${id}`);
      if (res.ok) {
        const data = await res.json();
        setQuestion(data.question || '');
        setAnswer(data.reponse || '');
        setCategory(data.category || 'seance');
        setOrder(data.order ?? 0);
        setStatus(data.status || 'draft');
        setReviewComment(data.reviewComment || '');
      }
      setLoading(false);
    })();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/cms/faq/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, reponse: answer, category, order }),
    });
    setSaving(false);
    router.push('/contenu');
  };

  const handleSubmit = async () => {
    await fetch('/api/cms/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type: 'faq' }),
    });
    router.push('/contenu');
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer cette FAQ ?')) return;
    await fetch(`/api/cms/faq/${id}`, { method: 'DELETE' });
    router.push('/contenu');
  };

  if (loading) return <div className="min-h-screen bg-sand flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sage" /></div>;

  return (
    <div className="min-h-screen bg-sand px-4 pt-4 pb-24">
      <header className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-1"><ArrowLeftIcon className="w-5 h-5 text-gray-600" /></button>
        <h1 className="text-lg font-bold text-gray-900 flex-1">Modifier FAQ</h1>
        <StatusBadge status={status} />
        <button onClick={handleDelete} className="p-1 text-red-400 hover:text-red-600"><TrashIcon className="w-5 h-5" /></button>
      </header>

      {reviewComment && (
        <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-sm text-amber-800">
          Commentaire Judith : {reviewComment}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 font-medium">Question</label>
          <input value={question} onChange={(e) => setQuestion(e.target.value)}
            className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-sage" />
        </div>

        <MarkdownField label="Reponse (markdown)" value={answer} onChange={setAnswer} rows={6} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium">Categorie</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-sage">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium">Ordre</label>
            <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))}
              className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-sage" />
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-sage text-white">
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          {status === 'draft' && (
            <button onClick={handleSubmit}
              className="flex-1 py-3 rounded-xl text-sm font-semibold bg-amber-500 text-white">
              Soumettre a Judith
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
