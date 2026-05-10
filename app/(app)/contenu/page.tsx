'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import ContentReviewCard, { type ContentType } from '@/components/features/cms/ContentReviewCard';
import DeleteConfirmModal from '@/components/features/cms/DeleteConfirmModal';
import ImageProposalsModal from '@/components/features/cms/ImageProposalsModal';
import type { PublicationStatus } from '@/lib/types/faq';
import type { ProposalResult } from '@/lib/cover-generator/variations';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  status: PublicationStatus;
  excerpt: string;
  updatedAt: string | null;
  reviewComment: string | null;
  imageProposals: ProposalResult[] | null;
  selectedImageId: string | null;
  regenerationCount: number;
  coverImage: string | null;
}

const TYPE_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'Tous' },
  { value: 'blog', label: 'Blog' },
  { value: 'faq', label: 'FAQ' },
  { value: 'ressource', label: 'Ressources' },
];

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'Tous' },
  { value: 'draft', label: 'Brouillons' },
  { value: 'pending', label: 'En attente' },
  { value: 'published', label: 'Publies' },
];

export default function ContenuPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: ContentType; title: string } | null>(null);
  const [proposalsTarget, setProposalsTarget] = useState<{
    contentRef: { type: string; slug: string; titre: string };
    proposals: ProposalResult[];
    regenerationCount: number;
  } | null>(null);
  const user = useAuthStore((s) => s.user);

  const refresh = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter) params.set('type', typeFilter);
    if (statusFilter) params.set('status', statusFilter);
    try {
      const res = await fetch(`/api/cms/list?${params}`);
      if (res.ok) {
        const data = await res.json() as { items: ContentItem[] };
        setItems(data.items || []);
      }
    } catch { /* fetch failed */ }
    finally { setLoading(false); }
  }, [typeFilter, statusFilter]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleOpenProposals = (item: ContentItem) => {
    if (!item.imageProposals || item.imageProposals.length === 0) {
      alert('Generation des propositions visuelles en cours... Reessayez dans 30 secondes.');
      return;
    }
    setProposalsTarget({
      contentRef: { type: item.type, slug: item.id, titre: item.title },
      proposals: item.imageProposals,
      regenerationCount: item.regenerationCount || 0,
    });
  };

  const handleProposalSelected = () => {
    setProposalsTarget(null);
    refresh();
  };

  const handleApprove = async (id: string, type: string) => {
    await fetch('/api/cms/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type, uid: user?.uid }),
    });
    refresh();
  };

  const handleComment = async (id: string, type: string) => {
    const comment = prompt('Commentaire pour Benoit :');
    if (!comment) return;
    await fetch('/api/cms/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type, comment, uid: user?.uid }),
    });
    refresh();
  };

  const handleUnpublish = async (id: string, type: string) => {
    if (!confirm('Retirer ce contenu du site public ?\n\nIl repassera en « En attente » et pourra être réapprouvé en 1 clic.')) return;
    await fetch('/api/cms/unpublish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type, uid: user?.uid }),
    });
    refresh();
  };

  const handleDelete = async (id: string, type: string) => {
    const res = await fetch('/api/cms/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type, uid: user?.uid }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { error?: string };
      alert(`Erreur : ${data.error || 'Suppression echouee'}`);
      return;
    }
    setDeleteTarget(null);
    refresh();
  };

  const pendingCount = items.filter((i) => i.status === 'pending').length;

  return (
    <div className="min-h-screen bg-sand px-4 pt-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Contenu du site</h1>
          {pendingCount > 0 && (
            <p className="text-xs text-amber-600 font-medium mt-0.5">
              {pendingCount} contenu{pendingCount > 1 ? 's' : ''} en attente de validation
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href="/contenu/faq/new" className="flex items-center gap-1 px-3 py-1.5 bg-sage text-white rounded-lg text-xs font-medium">
            <PlusIcon className="w-3.5 h-3.5" /> FAQ
          </Link>
          <Link href="/contenu/ressources/new" className="flex items-center gap-1 px-3 py-1.5 bg-sage text-white rounded-lg text-xs font-medium">
            <PlusIcon className="w-3.5 h-3.5" /> Ressource
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        <div className="flex gap-1 bg-white rounded-lg border border-gray-200 p-0.5">
          {TYPE_FILTERS.map((f) => (
            <button key={f.value} onClick={() => setTypeFilter(f.value)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition ${typeFilter === f.value ? 'bg-sage text-white' : 'text-gray-500'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-white rounded-lg border border-gray-200 p-0.5">
          {STATUS_FILTERS.map((f) => (
            <button key={f.value} onClick={() => setStatusFilter(f.value)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition ${statusFilter === f.value ? 'bg-sage text-white' : 'text-gray-500'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sage" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-12">Aucun contenu trouve.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={`${item.type}-${item.id}`}>
              <ContentReviewCard
                id={item.id}
                title={item.title}
                type={item.type}
                status={item.status}
                excerpt={item.excerpt}
                updatedAt={item.updatedAt || undefined}
                reviewComment={item.reviewComment || undefined}
              />
              {item.status === 'pending' && (
                <div className="flex flex-wrap gap-2 mt-1 ml-4">
                  {!item.selectedImageId && (
                    <button onClick={() => handleOpenProposals(item)}
                      className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                      {item.imageProposals && item.imageProposals.length > 0 ? 'Choisir image' : 'Generation...'}
                    </button>
                  )}
                  {item.selectedImageId && item.coverImage && (
                    <img src={item.coverImage} alt="" className="w-12 h-7 rounded object-cover border border-gray-200" />
                  )}
                  <button onClick={() => handleApprove(item.id, item.type)}
                    className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                    Approuver
                  </button>
                  <button onClick={() => handleComment(item.id, item.type)}
                    className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                    Commenter
                  </button>
                  <button onClick={() => setDeleteTarget({ id: item.id, type: item.type, title: item.title })}
                    className="text-[11px] font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-md ml-auto">
                    Supprimer
                  </button>
                </div>
              )}
              {item.status === 'published' && (
                <div className="flex gap-2 mt-1 ml-4">
                  <button onClick={() => handleUnpublish(item.id, item.type)}
                    className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md hover:bg-gray-200">
                    Retirer du site
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          title={deleteTarget.title}
          onConfirm={() => handleDelete(deleteTarget.id, deleteTarget.type)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {proposalsTarget && (
        <ImageProposalsModal
          isOpen={true}
          onClose={() => setProposalsTarget(null)}
          contentRef={proposalsTarget.contentRef}
          proposals={proposalsTarget.proposals}
          regenerationCount={proposalsTarget.regenerationCount}
          onSelected={handleProposalSelected}
        />
      )}
    </div>
  );
}
