'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useContentItems } from '@/lib/hooks/useContentItems';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { ArrowTopRightOnSquareIcon, ArrowRightStartOnRectangleIcon, XMarkIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ClockIcon, SparklesIcon } from '@heroicons/react/24/solid';

export default function ProfilPage() {
  const { user, signOut } = useAuth();
  const { data: items } = useContentItems();
  const { customCategories, updateCustomCategories } = useUserProfile();
  const [newCat, setNewCat] = useState('');

  const published = items.filter(i => i.distributionStatus === 'published');
  const scheduled = items.filter(i => i.distributionStatus === 'scheduled');
  const ready = items.filter(i => i.workflowState === 'ready');
  const recentPublished = published
    .sort((a, b) => (b.publishedAt?.toMillis() ?? 0) - (a.publishedAt?.toMillis() ?? 0))
    .slice(0, 10);

  const addCategory = () => {
    if (!newCat.trim() || customCategories.includes(newCat.trim())) return;
    updateCustomCategories([...customCategories, newCat.trim()]);
    setNewCat('');
  };

  return (
    <div className="min-h-screen bg-sand">
      <div className="px-4 pt-6 pb-4">
        {/* Avatar + nom */}
        <div className="flex items-center gap-3 mb-6">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-14 h-14 rounded-full" referrerPolicy="no-referrer"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <div className="w-14 h-14 rounded-full bg-sage/20 flex items-center justify-center text-sage text-xl font-bold">
              {user?.displayName?.charAt(0) || '?'}
            </div>
          )}
          <div>
            <h1 className="text-lg font-semibold text-gray-900">{user?.displayName || 'Mon profil'}</h1>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="bg-white rounded-xl p-3 text-center">
            <CheckCircleIcon className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{published.length}</p>
            <p className="text-[10px] text-gray-500">Publiees</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <ClockIcon className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{scheduled.length}</p>
            <p className="text-[10px] text-gray-500">Planifiees</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <SparklesIcon className="w-5 h-5 text-sage mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">{ready.length}</p>
            <p className="text-[10px] text-gray-500">Pretes</p>
          </div>
        </div>
        <Link href="/stats" className="flex items-center gap-1 text-xs text-sage font-medium mb-6">
          Voir toutes les stats <ChevronRightIcon className="w-3 h-3" />
        </Link>

        {/* Lien Wix */}
        <a href={process.env.NEXT_PUBLIC_WIX_URL || 'https://judithtremblay.com'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white rounded-xl p-3 mb-6">
          <ArrowTopRightOnSquareIcon className="w-5 h-5 text-sage" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Mon site Wix</p>
            <p className="text-xs text-gray-500">{process.env.NEXT_PUBLIC_WIX_URL?.replace('https://', '') || 'judithtremblay.com'}</p>
          </div>
        </a>

        {/* Mes categories custom */}
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Mes categories</h2>
        <div className="space-y-1.5 mb-6">
          {customCategories.map(cat => (
            <div key={cat} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
              <span className="text-sm text-gray-800">{cat}</span>
              <button onClick={() => updateCustomCategories(customCategories.filter(c => c !== cat))}>
                <XMarkIcon className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCategory()}
              placeholder="Nouvelle categorie" className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
            <button onClick={addCategory} disabled={!newCat.trim()} className="flex items-center gap-1 px-3 py-1.5 bg-sage text-white rounded-lg text-sm disabled:opacity-50">
              <PlusIcon className="w-3.5 h-3.5" />
            </button>
          </div>
          {customCategories.length === 0 && <p className="text-xs text-gray-400">Aucune categorie personnalisee</p>}
        </div>

        {/* Historique publications */}
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Dernieres publications</h2>
        {recentPublished.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">Aucune publication pour le moment</p>
        ) : (
          <div className="space-y-2">
            {recentPublished.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-3">
                {item.thumbnailUrl && <img src={item.thumbnailUrl} alt="" className="w-10 h-14 object-cover rounded" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                  {item.publishedAt && (
                    <p className="text-[10px] text-gray-500">{item.publishedAt.toDate().toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  )}
                </div>
                <CheckCircleIcon className="w-4 h-4 text-green-500 shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* Deconnexion */}
        <button onClick={signOut} className="w-full mt-6 flex items-center justify-center gap-2 py-3 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
          <ArrowRightStartOnRectangleIcon className="w-5 h-5" /> Se deconnecter
        </button>
      </div>
    </div>
  );
}
