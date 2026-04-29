'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import MarkdownField from '@/components/features/cms/MarkdownField';
import StatusBadge from '@/components/features/cms/StatusBadge';
import type { PublicationStatus } from '@/lib/types/faq';

const PILIERS = ['fertilite', 'grossesse', 'pediatrie', 'acupuncture-sociale', 'transversal'];

interface Citation { authors: string; title: string; journal: string; year: string; pmid: string; summary: string }
interface FaqEntry { question: string; answer: string }

export default function EditRessourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [pilier, setPilier] = useState('transversal');
  const [status, setStatus] = useState<PublicationStatus>('draft');
  const [reviewComment, setReviewComment] = useState('');
  const [introSection, setIntroSection] = useState('');
  const [scienceSection, setScienceSection] = useState('');
  const [approcheSection, setApprocheSection] = useState('');
  const [faqSection, setFaqSection] = useState('');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [faqEntries, setFaqEntries] = useState<FaqEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('contenu');

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/cms/ressources/${id}`);
      if (res.ok) {
        const d = await res.json();
        setTitle(d.title || '');
        setMetaDescription(d.metaDescription || '');
        setPilier(d.pilier || 'transversal');
        setStatus(d.status || 'draft');
        setReviewComment(d.reviewComment || '');
        setIntroSection(d.introSection || '');
        setScienceSection(d.scienceSection || '');
        setApprocheSection(d.judithApproach || '');
        setFaqSection(d.protocolSection || '');
        setCitations((d.citations || []).map((c: Record<string, unknown>) => ({
          authors: c.authors || '', title: c.title || '', journal: c.journal || '',
          year: String(c.year || ''), pmid: c.pmid || c.url || '', summary: c.summary || '',
        })));
        setFaqEntries(d.faqEntries || []);
      }
      setLoading(false);
    })();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/cms/ressources/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, metaDescription, pilier, introSection, scienceSection,
        judithApproach: approcheSection, protocolSection: faqSection,
        citations: citations.map((c) => ({ ...c, year: Number(c.year) || 2025 })),
        faqEntries,
      }),
    });
    setSaving(false);
    router.push('/contenu');
  };

  const handleSubmit = async () => {
    await fetch('/api/cms/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type: 'ressource' }),
    });
    router.push('/contenu');
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer cette ressource ?')) return;
    await fetch(`/api/cms/ressources/${id}`, { method: 'DELETE' });
    router.push('/contenu');
  };

  const toggleSection = (s: string) => setOpenSection(openSection === s ? null : s);

  if (loading) return <div className="min-h-screen bg-sand flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sage" /></div>;

  return (
    <div className="min-h-screen bg-sand px-4 pt-4 pb-24">
      <header className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-1"><ArrowLeftIcon className="w-5 h-5 text-gray-600" /></button>
        <h1 className="text-lg font-bold text-gray-900 flex-1 truncate">{title || 'Modifier ressource'}</h1>
        <StatusBadge status={status} />
        <button onClick={handleDelete} className="p-1 text-red-400 hover:text-red-600"><TrashIcon className="w-5 h-5" /></button>
      </header>

      {reviewComment && (
        <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-sm text-amber-800">
          Commentaire Judith : {reviewComment}
        </div>
      )}

      <div className="space-y-3">
        <Accordion title="Informations de base" open={openSection === 'base'} onToggle={() => toggleSection('base')}>
          <div className="space-y-3">
            <Field label="Titre" value={title} onChange={setTitle} />
            <div>
              <label className="text-xs text-gray-500 font-medium">Pilier</label>
              <select value={pilier} onChange={(e) => setPilier(e.target.value)}
                className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-sage">
                {PILIERS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Meta description ({metaDescription.length}/155)</label>
              <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value.slice(0, 155))} rows={2}
                className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-sage resize-none" />
            </div>
          </div>
        </Accordion>

        <Accordion title="Contenu principal" open={openSection === 'contenu'} onToggle={() => toggleSection('contenu')}>
          <div className="space-y-4">
            <MarkdownField label="Introduction" value={introSection} onChange={setIntroSection} rows={6} />
            <MarkdownField label="Mon approche (Judith)" value={approcheSection} onChange={setApprocheSection} rows={6} />
            <MarkdownField label="Protocole / FAQ inline" value={faqSection} onChange={setFaqSection} rows={6} />
            <MarkdownField label="Ce que la science dit" value={scienceSection} onChange={setScienceSection} rows={8} />
          </div>
        </Accordion>

        <Accordion title={`Citations (${citations.length})`} open={openSection === 'citations'} onToggle={() => toggleSection('citations')}>
          <div className="space-y-3">
            {citations.map((c, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2 relative">
                <button onClick={() => setCitations(citations.filter((_, j) => j !== i))}
                  className="absolute top-2 right-2 text-gray-400"><XMarkIcon className="w-4 h-4" /></button>
                <Field label="Auteurs" value={c.authors} onChange={(v) => setCitations(citations.map((x, j) => j === i ? { ...x, authors: v } : x))} />
                <Field label="Titre" value={c.title} onChange={(v) => setCitations(citations.map((x, j) => j === i ? { ...x, title: v } : x))} />
                <div className="grid grid-cols-3 gap-2">
                  <Field label="Journal" value={c.journal} onChange={(v) => setCitations(citations.map((x, j) => j === i ? { ...x, journal: v } : x))} />
                  <Field label="Annee" value={c.year} onChange={(v) => setCitations(citations.map((x, j) => j === i ? { ...x, year: v } : x))} />
                  <Field label="PMID" value={c.pmid} onChange={(v) => setCitations(citations.map((x, j) => j === i ? { ...x, pmid: v } : x))} />
                </div>
              </div>
            ))}
            <button onClick={() => setCitations([...citations, { authors: '', title: '', journal: '', year: '', pmid: '', summary: '' }])}
              className="flex items-center gap-1 text-xs font-medium text-sage"><PlusIcon className="w-3.5 h-3.5" /> Ajouter une citation</button>
          </div>
        </Accordion>

        <Accordion title={`FAQ associees (${faqEntries.length})`} open={openSection === 'faqs'} onToggle={() => toggleSection('faqs')}>
          <div className="space-y-3">
            {faqEntries.map((f, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2 relative">
                <button onClick={() => setFaqEntries(faqEntries.filter((_, j) => j !== i))}
                  className="absolute top-2 right-2 text-gray-400"><XMarkIcon className="w-4 h-4" /></button>
                <Field label="Question" value={f.question} onChange={(v) => setFaqEntries(faqEntries.map((x, j) => j === i ? { ...x, question: v } : x))} />
                <MarkdownField label="Reponse" value={f.answer} onChange={(v) => setFaqEntries(faqEntries.map((x, j) => j === i ? { ...x, answer: v } : x))} rows={3} />
              </div>
            ))}
            <button onClick={() => setFaqEntries([...faqEntries, { question: '', answer: '' }])}
              className="flex items-center gap-1 text-xs font-medium text-sage"><PlusIcon className="w-3.5 h-3.5" /> Ajouter une FAQ</button>
          </div>
        </Accordion>

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

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-gray-500 font-medium">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-sage" />
    </div>
  );
}

function Accordion({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button onClick={onToggle} className="w-full px-4 py-3 text-left flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        <span className="text-gray-400 text-xs">{open ? 'Fermer' : 'Ouvrir'}</span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
