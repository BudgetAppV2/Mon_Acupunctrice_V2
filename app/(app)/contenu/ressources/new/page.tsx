'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import MarkdownField from '@/components/features/cms/MarkdownField';

const PILIERS = ['fertilite', 'grossesse', 'pediatrie', 'acupuncture-sociale', 'transversal'];

interface Citation { authors: string; title: string; journal: string; year: string; pmid: string; summary: string }
interface FaqEntry { question: string; answer: string }

export default function NewRessourcePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [pilier, setPilier] = useState('transversal');
  const [heroImage, setHeroImage] = useState('');
  const [introSection, setIntroSection] = useState('');
  const [scienceSection, setScienceSection] = useState('');
  const [approcheSection, setApprocheSection] = useState('');
  const [faqSection, setFaqSection] = useState('');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [faqEntries, setFaqEntries] = useState<FaqEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('base');

  const autoSlug = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/cms/ressources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, slug: slug || autoSlug(title), metaDescription, pilier, heroImageUrl: heroImage,
          introSection, scienceSection, judithApproach: approcheSection, protocolSection: faqSection,
          citations: citations.map((c) => ({ ...c, year: Number(c.year) || 2025 })),
          faqEntries,
        }),
      });
      if (res.ok) router.push('/contenu');
    } catch { /* save failed */ }
    finally { setSaving(false); }
  };

  const toggleSection = (s: string) => setOpenSection(openSection === s ? null : s);

  return (
    <div className="min-h-screen bg-sand px-4 pt-4 pb-24">
      <header className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-1"><ArrowLeftIcon className="w-5 h-5 text-gray-600" /></button>
        <h1 className="text-lg font-bold text-gray-900">Nouvelle ressource</h1>
      </header>

      <div className="space-y-3">
        {/* Section: Base */}
        <Accordion title="Informations de base" open={openSection === 'base'} onToggle={() => toggleSection('base')}>
          <div className="space-y-3">
            <Field label="Titre" value={title} onChange={(v) => { setTitle(v); if (!slug) setSlug(autoSlug(v)); }} />
            <Field label="Slug" value={slug} onChange={setSlug} />
            <div>
              <label className="text-xs text-gray-500 font-medium">Meta description ({metaDescription.length}/155)</label>
              <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value.slice(0, 155))} rows={2}
                className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-sage resize-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Pilier</label>
              <select value={pilier} onChange={(e) => setPilier(e.target.value)}
                className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-sage">
                {PILIERS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <Field label="Image hero (URL)" value={heroImage} onChange={setHeroImage} />
          </div>
        </Accordion>

        {/* Section: Contenu */}
        <Accordion title="Contenu principal" open={openSection === 'contenu'} onToggle={() => toggleSection('contenu')}>
          <div className="space-y-4">
            <MarkdownField label="Introduction" value={introSection} onChange={setIntroSection} rows={6} />
            <MarkdownField label="Mon approche (Judith)" value={approcheSection} onChange={setApprocheSection} rows={6} />
            <MarkdownField label="Protocole / FAQ inline" value={faqSection} onChange={setFaqSection} rows={6} />
            <MarkdownField label="Ce que la science dit" value={scienceSection} onChange={setScienceSection} rows={8} />
          </div>
        </Accordion>

        {/* Section: Citations */}
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
                <Field label="Resume" value={c.summary} onChange={(v) => setCitations(citations.map((x, j) => j === i ? { ...x, summary: v } : x))} />
              </div>
            ))}
            <button onClick={() => setCitations([...citations, { authors: '', title: '', journal: '', year: '', pmid: '', summary: '' }])}
              className="flex items-center gap-1 text-xs font-medium text-sage"><PlusIcon className="w-3.5 h-3.5" /> Ajouter une citation</button>
          </div>
        </Accordion>

        {/* Section: FAQ */}
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

        <button onClick={handleSave} disabled={saving || !title.trim()}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition ${!saving && title.trim() ? 'bg-sage text-white' : 'bg-gray-200 text-gray-400'}`}>
          {saving ? 'Enregistrement...' : 'Enregistrer (brouillon)'}
        </button>
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
