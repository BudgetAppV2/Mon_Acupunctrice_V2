'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import MarkdownField from '@/components/features/cms/MarkdownField';

const CATEGORIES = ['fertilite', 'grossesse', 'pediatrie', 'acupuncture-sociale', 'seance'];

export default function NewFaqPage() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('seance');
  const [order, setOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/cms/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer, category, order }),
      });
      if (res.ok) router.push('/contenu');
    } catch { /* save failed */ }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-sand px-4 pt-4 pb-24">
      <header className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-1"><ArrowLeftIcon className="w-5 h-5 text-gray-600" /></button>
        <h1 className="text-lg font-bold text-gray-900">Nouvelle FAQ</h1>
      </header>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 font-medium">Question</label>
          <input value={question} onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ex: L'acupuncture fait-elle mal ?"
            className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-sage" />
        </div>

        <MarkdownField label="Reponse (markdown)" value={answer} onChange={setAnswer} placeholder="Reponse en markdown..." rows={6} />

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

        <button onClick={handleSave} disabled={saving || !question.trim() || !answer.trim()}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition ${!saving && question.trim() && answer.trim() ? 'bg-sage text-white' : 'bg-gray-200 text-gray-400'}`}>
          {saving ? 'Enregistrement...' : 'Enregistrer (brouillon)'}
        </button>
      </div>
    </div>
  );
}
